import crypto from "crypto";
import { supabase } from "../config/supabaseClient.js";
import { logInfo, logError, logSuccess } from "../utils/logger.util.js";
import { sanitizeIdentifier, escapeSingleQuotes } from "../utils/sql.util.js";

// Infer basic types
const inferType = (v) => {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    if (typeof v === "boolean") return "boolean";
    if (typeof v === "number") return Number.isInteger(v) ? "integer" : "float";

    if (typeof v === "string") {
        const iso = /^\d{4}-\d{2}-\d{2}T/;
        if (iso.test(v)) return "timestamp";
        if (!isNaN(Number(v))) return "numeric_string";
        return "string";
    }

    if (typeof v === "object") return "object";
    return "string";
};

// Build schema signature + hash
const buildSchemaSignature = (items) => {
    const sample = items[0];
    const keys = Object.keys(sample).sort();

    const parts = keys.map((k) => {
        let derived = "null";
        for (const row of items) {
            if (row[k] !== null && row[k] !== undefined) {
                derived = inferType(row[k]);
                break;
            }
        }
        return `${k}:${derived}`;
    });

    const signature = parts.join("|");
    const hash = crypto.createHash("sha256").update(signature).digest("hex").slice(0, 12);

    return { signature, hash };
};

// Simple type mapping
const mapTypeToSQL = (t) => {
    switch (t) {
        case "integer": return "INTEGER";
        case "float": return "DOUBLE PRECISION";
        case "boolean": return "BOOLEAN";
        case "timestamp": return "TIMESTAMPTZ";
        case "numeric_string": return "NUMERIC";
        default: return "TEXT";
    }
};

// Insert rows via exec_sql to avoid schema-cache
const insertViaExecSQL = async (tableName, cols, rows) => {
    const safeTable = sanitizeIdentifier(tableName);

    // Convert rows to JSON literal
    const jsonPayload = escapeSingleQuotes(JSON.stringify(rows));

    // Column names
    const colNames = cols.map(c => `"${sanitizeIdentifier(c.colName)}"`).join(", ");

    // CORRECT FIX: alias columns must use REAL SQL types
    const aliasCols = cols
        .map(c => `${sanitizeIdentifier(c.colName)} ${c.sqlType}`)
        .join(", ");

    const insertSQL = `
    INSERT INTO "${safeTable}" (${colNames}, raw)
    SELECT
      ${cols.map(c => `x."${sanitizeIdentifier(c.colName)}"`).join(", ")},
      row_to_json(x)::jsonb
    FROM jsonb_to_recordset('${jsonPayload}') AS x(${aliasCols});
  `;

    const { error } = await supabase.rpc("exec_sql", { sql: insertSQL });
    if (error) throw new Error(error.message);

    logSuccess(`Inserted ${rows.length} rows into ${safeTable}`);
};

// MAIN ENTRYPOINT
export const processJSON = async (inputData) => {
    const items = Array.isArray(inputData) ? inputData : [inputData];

    if (items.length === 0) return { mode: "NoData" };

    // Check relationality (same keys)
    const baseKeys = Object.keys(items[0]).sort();
    for (let i = 1; i < items.length; i++) {
        const keys = Object.keys(items[i]).sort();
        if (JSON.stringify(keys) !== JSON.stringify(baseKeys)) {
            // inconsistent → JSONB
            await supabase.from("documents").insert([
                {
                    data: inputData,   // store ENTIRE batch (object OR array)
                    metadata: { reason: "INCONSISTENT_SCHEMA" }
                }
            ]);

            return {
                mode: "NoSQL",
                status: "Stored entire batch as one unstructured document",
                destinationTable: "documents",
                matchedSchema: "INCONSISTENT",
                rowsInserted: 1
            };
        }
    }

    // Relational → generate signature + hash
    const { signature, hash } = buildSchemaSignature(items);
    const schemaId = hash;

    logInfo("Schema signature", { signature, schemaId });

    // Does this schema already exist?
    const { data: existing, error: lookupErr } = await supabase
        .from("schemas")
        .select("*")
        .eq("schema_id", schemaId)
        .maybeSingle();

    // Existing schema → reuse table
    if (existing && existing.table_name) {
        await insertViaExecSQL(existing.table_name, existing.columns, items);

        return {
            mode: "SQL",
            status: "Appended to existing table",
            destinationTable: existing.table_name,
            matchedSchema: signature,
            rowsInserted: items.length
        };
    }

    // NEW SCHEMA → create table
    const tableName = `data_${schemaId}`;
    const safeTable = sanitizeIdentifier(tableName);

    // Build column definitions
    const cols = baseKeys.map((k) => {
        const colType = (() => {
            for (const row of items) {
                if (row[k] !== null && row[k] !== undefined) return inferType(row[k]);
            }
            return "string";
        })();

        return {
            colName: sanitizeIdentifier(k),
            sqlType: mapTypeToSQL(colType)
        };
    });

    const colDefSQL = cols
        .map((c) => `"${c.colName}" ${c.sqlType}`)
        .join(", ");

    const createSQL = `
    CREATE TABLE IF NOT EXISTS "${safeTable}" (
      id BIGSERIAL PRIMARY KEY,
      ${colDefSQL},
      raw JSONB
    );
  `;

    const { error: createErr } = await supabase.rpc("exec_sql", { sql: createSQL });
    if (createErr) throw new Error(createErr.message);

    // Save schema registry
    await supabase.from("schemas").insert([
        {
            schema_id: schemaId,
            signature,
            table_name: safeTable,
            columns: cols   // store column definitions for reuse
        }
    ]);

    // Insert data
    await insertViaExecSQL(safeTable, cols, items);

    return {
        mode: "SQL",
        status: "Created new table",
        destinationTable: safeTable,
        generatedSchema: cols.map(c => ({
            column: c.colName,
            type: c.sqlType
        })),
        rowsInserted: items.length
    };
};