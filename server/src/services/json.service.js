// src/services/json.service.js
import crypto from "crypto";
import { supabase } from "../config/supabaseClient.js";
import { logInfo, logError, logSuccess } from "../utils/logger.util.js";
import { sanitizeIdentifier, escapeSingleQuotes } from "../utils/sql.util.js";

/* Configurable thresholds */
const MAX_SAFE_STRING = 1_000_000; // if string length > this -> NoSQL
const MAX_NUMERIC_DIGITS = 100;    // fallback to NoSQL if more than this digits
const INT_MAX = 2147483647;
const BIGINT_MAX = 9223372036854775807n;

/* Helpers */

// detect if string looks like an integer (digits only, optional leading -)
const isIntegerString = (s) => /^-?\d+$/.test(String(s));

// detect ISO timestamp-ish
const isIsoTimestamp = (s) => {
  if (typeof s !== "string") return false;
  // basic ISO date-time detection
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s);
};

// safe conversion to BigInt for numeric-like values (handles numeric strings)
const toBigIntSafely = (v) => {
  try {
    if (typeof v === "bigint") return v;
    if (typeof v === "number") {
      // if not safe integer, convert via string to avoid precision loss
      if (!Number.isSafeInteger(v)) return BigInt(String(Math.trunc(v)));
      return BigInt(Math.trunc(v));
    }
    if (typeof v === "string" && isIntegerString(v)) return BigInt(v);
    return null;
  } catch {
    return null;
  }
};

/* Type inference per single value:
   returns one of:
   integer, bigint, numeric, float, boolean, timestamp, string, jsonb, array, object, null, mixed, overflow
*/

const inferSingleValueType = (v) => {
  if (v === null || v === undefined) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "object") return "object";
  if (typeof v === "boolean") return "boolean";

  if (typeof v === "number") {
    // Non-finite numbers (e.g., Infinity from huge JSON numerals) are treated as overflow
    if (!Number.isFinite(v)) return "overflow";
    if (!Number.isInteger(v)) return "float";
    try {
      const bi = toBigIntSafely(v);
      if (bi === null) return "numeric";
      if (bi > BIGINT_MAX) return "overflow";
      if (bi > BigInt(INT_MAX)) return "bigint";
      return "integer";
    } catch {
      return "numeric";
    }
  }

  if (typeof v === "string") {
    // NOTE: do NOT treat numeric-strings as numeric for type-consistency detection.
    // Keep numeric-string flagged separately so we can decide mixed string/number => NoSQL.
    if (isIntegerString(v)) {
      // mark numeric string separately
      const bi = toBigIntSafely(v);
      if (bi === null) return "numeric_string";
      if (bi > BIGINT_MAX) return "overflow";
      if (v.length > MAX_NUMERIC_DIGITS) return "overflow";
      return "numeric_string";
    }
    if (isIsoTimestamp(v)) return "timestamp";
    if (v.length > MAX_SAFE_STRING) return "string_overflow";
    return "string";
  }

  return "string";
};


/* Given a list of column types seen across rows, reduce to final decision.
   - If mixed types that cannot be promoted => return { decision: "NoSQL", reason: ... }
   - Else return { decision: "SQL", finalType: "INTEGER|BIGINT|NUMERIC|DOUBLE PRECISION|TIMESTAMPTZ|TEXT|JSONB|BOOLEAN" }
*/

const decideColumnTypeFromSamples = (typesSet, samples) => {
  const types = Array.from(typesSet).filter(t => t && t !== "null");

  if (types.length === 0) {
    return { decision: "SQL", finalType: "TEXT" };
  }

  // ---------- HARD RULE: ANY OVERFLOW => ALWAYS NoSQL ----------
  if (types.includes("overflow") || types.includes("string_overflow")) {
    return { decision: "NoSQL", reason: "OVERFLOW" };
  }

  // ---------- Mixed numeric + string or numeric_string => NoSQL ----------
  const numericTypes = ["integer", "bigint", "float", "numeric"];
  const hasNumeric = types.some(t => numericTypes.includes(t));
  const hasPlainString = types.includes("string");
  const hasNumericString = types.includes("numeric_string");

  if ((hasPlainString || hasNumericString) && hasNumeric) {
    return {
      decision: "NoSQL",
      reason: hasPlainString ? "MIXED_STRING_NUMBER" : "MIXED_NUMERIC_STRING"
    };
  }

  // ---------- Pure object => JSONB ----------
  if (types.length === 1 && types[0] === "object") {
    return { decision: "SQL", finalType: "JSONB" };
  }

  // ---------- Arrays Handling ----------
  if (types.includes("array")) {
    const arraySamples = samples.filter(s => Array.isArray(s));

    // Extract element type sets for each array sample
    const elementTypeSets = arraySamples.map(arr => {
      const s = new Set();
      for (const el of arr) {
        if (el === null || el === undefined) { s.add("null"); continue; }
        if (Array.isArray(el)) { s.add("array"); continue; }
        if (typeof el === "object") { s.add("object"); continue; }
        if (typeof el === "number") s.add("number");
        if (typeof el === "string") s.add("string");
        if (typeof el === "boolean") s.add("boolean");
      }
      return s;
    });

    // Check if all rows have the same element types
    let allElemSame = true;
    for (let i = 1; i < elementTypeSets.length; i++) {
      const a = Array.from(elementTypeSets[0]).sort().join(",");
      const b = Array.from(elementTypeSets[i]).sort().join(",");
      if (a !== b) {
        allElemSame = false;
        break;
      }
    }

    // Mixed element types => NoSQL
    if (!allElemSame) {
      return { decision: "NoSQL", reason: "ARRAYS_MIXED" };
    }

    // Arrays of uniform scalars or uniform objects => JSONB column
    return { decision: "SQL", finalType: "JSONB" };
  }

  // ---------- Numeric-only promotion (safe) ----------
  const presentNumeric = types.filter(t => numericTypes.includes(t));

  if (presentNumeric.length === types.length) {
    // widest type selection
    if (types.includes("numeric") || types.includes("float")) {
      return { decision: "SQL", finalType: "DOUBLE PRECISION" };
    }
    if (types.includes("bigint")) {
      return { decision: "SQL", finalType: "BIGINT" };
    }
    return { decision: "SQL", finalType: "INTEGER" };
  }

  // ---------- Boolean only ----------
  if (types.length === 1 && types[0] === "boolean") {
    return { decision: "SQL", finalType: "BOOLEAN" };
  }

  // ---------- Pure timestamp ----------
  if (types.length === 1 && types[0] === "timestamp") {
    return { decision: "SQL", finalType: "TIMESTAMPTZ" };
  }

  // ---------- Pure string ----------
  if (types.length === 1 && types[0] === "string") {
    return { decision: "SQL", finalType: "TEXT" };
  }

  // ---------- Default fallback ----------
  return { decision: "NoSQL", reason: "MIXED_TYPES" };
};



/* Build schema signature and gather per-column samples/types */
const buildSignatureAndColumnInfo = (items) => {
  const keys = Object.keys(items[0]).sort();
  const columnsInfo = {};
  let overallOverflow = false;

  for (const k of keys) columnsInfo[k] = { types: new Set(), samples: [] };

  for (const row of items) {
    for (const k of keys) {
      const v = row[k];
      const t = inferSingleValueType(v);
      columnsInfo[k].types.add(t);
      if (columnsInfo[k].samples.length < 5) columnsInfo[k].samples.push(v);
      if (t === "overflow" || t === "string_overflow") overallOverflow = true;
    }
  }

  // build signature parts: use conservative representative type
  const parts = keys.map(k => {
    const typesArr = Array.from(columnsInfo[k].types).filter(x => x !== "null");
    let tag;
    if (typesArr.length === 0) tag = "null";
    else if (typesArr.length === 1) tag = typesArr[0];
    else {
      // numeric mixture -> choose widest numeric label
      const numericTypes = typesArr.filter(t => ["integer","bigint","float","numeric","numeric_string"].includes(t));
      if (numericTypes.length === typesArr.length && numericTypes.length > 0) {
        if (typesArr.includes("numeric") || typesArr.includes("float")) tag = "float";
        else if (typesArr.includes("bigint")) tag = "bigint";
        else tag = "integer";
      } else tag = "mixed";
    }
    return `${k}:${tag}`;
  });

  const signature = parts.join("|");
  const hash = crypto.createHash("sha256").update(signature).digest("hex").slice(0, 12);
  return { signature, hash, columnsInfo, overallOverflow };
};


/* Insert via exec_sql using typed aliases based on final SQL types */
const insertViaExecSQL = async (tableName, cols, rows) => {
  const safeTable = sanitizeIdentifier(tableName);
  const payload = escapeSingleQuotes(JSON.stringify(rows));

  const colList = cols.map(c => `"${sanitizeIdentifier(c.colName)}"`).join(", ");
  const aliasCols = cols.map(c => `${sanitizeIdentifier(c.colName)} ${c.sqlType}`).join(", ");

  const insertSQL = `
    INSERT INTO "${safeTable}" (${colList}, raw)
    SELECT ${cols.map(c => `x."${sanitizeIdentifier(c.colName)}"`).join(", ")}, row_to_json(x)::jsonb
    FROM jsonb_to_recordset('${payload}') AS x(${aliasCols});
  `;

  const { error } = await supabase.rpc("exec_sql", { sql: insertSQL });
  if (error) throw new Error(error.message);
  logSuccess(`Inserted ${rows.length} rows into ${safeTable}`);
};

/* Main entry */
export const processJSON = async (inputData) => {
  try {
    const items = Array.isArray(inputData) ? inputData : [inputData];
    if (items.length === 0) return { mode: "NoData" };

    // ensure all rows share exact same keys; if not, store whole batch as a single document
    const baseKeys = Object.keys(items[0]).sort();
    for (let i = 1; i < items.length; i++) {
      const keys = Object.keys(items[i]).sort();
      if (JSON.stringify(keys) !== JSON.stringify(baseKeys)) {
        await supabase.from("documents").insert([{ data: inputData, metadata: { reason: "INCONSISTENT_KEYS" } }]);
        return {
          mode: "NoSQL",
          status: "Stored entire batch as one unstructured document",
          destinationTable: "documents",
          matchedSchema: "INCONSISTENT_KEYS",
          rowsInserted: 1
        };
      }
    }

    // Build signature + column info
    const { signature, hash, columnsInfo, overallOverflow } = buildSignatureAndColumnInfo(items);
    logInfo("Schema signature", { signature, schemaId: hash });

    if (overallOverflow) {
      await supabase.from("documents").insert([{ data: inputData, metadata: { reason: "OVERFLOW_DETECTED" } }]);
      return {
        mode: "NoSQL",
        status: "Stored entire batch as one unstructured document",
        destinationTable: "documents",
        matchedSchema: "INCONSISTENT_OVERFLOW",
        rowsInserted: 1
      };
    }

    // Decide per-column SQL suitability
    const cols = []; // will be array of { colName, sqlType, origKey }
    for (const key of baseKeys) {
      const info = columnsInfo[key];
      const decision = decideColumnTypeFromSamples(info.types, info.samples);

      if (decision.decision === "NoSQL") {
        // fallback: store entire batch as single document (organizer rule)
        await supabase.from("documents").insert([{ data: inputData, metadata: { reason: decision.reason || "MIXED_TYPES" } }]);
        return {
          mode: "NoSQL",
          status: "Stored entire batch as one unstructured document",
          destinationTable: "documents",
          matchedSchema: decision.reason || "INCONSISTENT_TYPES",
          rowsInserted: 1
        };
      }

      cols.push({
        colName: sanitizeIdentifier(key),
        sqlType: decision.finalType,
        origKey: key
      });
    }

    // Check existence in registry
    const { data: existing } = await supabase.from("schemas").select("*").eq("schema_id", hash).maybeSingle();

    if (existing && existing.table_name && existing.columns && Array.isArray(existing.columns)) {
      // reuse existing
      await insertViaExecSQL(existing.table_name, existing.columns, items);
      return {
        mode: "SQL",
        status: "Appended to existing table",
        destinationTable: existing.table_name,
        matchedSchema: signature,
        rowsInserted: items.length
      };
    }

    // Prepare table creation
    const hasClientId = baseKeys.map(k => k.toLowerCase()).includes("id");
    const tableName = `data_${hash}`;
    const safeTable = sanitizeIdentifier(tableName);

    // Build column defs; if incoming contains "id" we DO NOT add internal BIGSERIAL id
    const colDefs = cols.map(c => `"${c.colName}" ${c.sqlType}`).join(", ");
    const createSQL = hasClientId
      ? `CREATE TABLE IF NOT EXISTS "${safeTable}" (${colDefs}, raw JSONB);`
      : `CREATE TABLE IF NOT EXISTS "${safeTable}" (id BIGSERIAL PRIMARY KEY, ${colDefs}, raw JSONB);`;

    const { error: createErr } = await supabase.rpc("exec_sql", { sql: createSQL });
    if (createErr) throw new Error("Create table failed: " + createErr.message);

    // Save registry (columns as JSONB)
    const registryRow = {
      schema_id: hash,
      signature,
      table_name: safeTable,
      columns: cols
    };
    const { error: regErr } = await supabase.from("schemas").insert([registryRow]);
    if (regErr) throw new Error("Registry insert failed: " + regErr.message);

    // Insert rows
    await insertViaExecSQL(safeTable, cols, items);

    return {
      mode: "SQL",
      status: "Created new table",
      destinationTable: safeTable,
      generatedSchema: cols.map(c => ({ column: c.colName, type: c.sqlType })),
      rowsInserted: items.length
    };

  } catch (err) {
    logError("JSON processing failed", { error: err.message });
    throw err;
  }
};