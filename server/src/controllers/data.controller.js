import { supabase } from "../config/supabaseClient.js";
import { logError, logInfo } from "../utils/logger.util.js";

// GET /api/files - Retrieve all uploaded files
export const getFiles = async (req, res) => {
  try {
    logInfo("Files endpoint hit");
    
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) throw new Error(error.message);

    return res.json({ files: data || [] });
  } catch (err) {
    logError("Get files failed", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/schemas - Retrieve all schemas from registry (SQL) and NoSQL documents
export const getSchemas = async (req, res) => {
  try {
    logInfo("Schemas endpoint hit");
    
    // Get SQL schemas
    const { data: sqlSchemas, error: sqlError } = await supabase
      .from("schemas")
      .select("*")
      .order("created_at", { ascending: false });

    if (sqlError) throw new Error(sqlError.message);

    // Get NoSQL documents - create individual schema entries for each document
    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select("id, created_at")
      .order("created_at", { ascending: false });

    if (docsError) {
      logError("Failed to get NoSQL documents", { error: docsError.message });
    }

    // Create combined response with SQL schemas and individual NoSQL document entries
    const schemas = [...(sqlSchemas || [])];
    
    // Add each NoSQL document as a separate schema entry
    if (documents && documents.length > 0) {
      documents.forEach((doc) => {
        schemas.push({
          table_name: `document_${doc.id}`,
          signature: 'NoSQL',
          schema_type: 'nosql',
          document_id: doc.id,
          created_at: doc.created_at
        });
      });
    }

    return res.json({ schemas });
  } catch (err) {
    logError("Get schemas failed", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/data/:tableName - Retrieve data from a specific table
export const getTableData = async (req, res) => {
  try {
    const { tableName } = req.params;
    logInfo("Table data endpoint hit", { tableName });

    // Validate table name (security: prevent SQL injection)
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).json({ error: "Invalid table name" });
    }

    // Handle individual NoSQL document retrieval (document_<id>)
    if (tableName.startsWith('document_')) {
      const docId = tableName.replace('document_', '');
      
      const { data, error } = await supabase
        .from("documents")
        .select("id, data, metadata, created_at")
        .eq("id", docId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return res.json({ 
        table: tableName,
        type: 'nosql',
        document: data,
        count: 1
      });
    }

    // Handle regular SQL tables
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .limit(100);

    if (error) {
      // Check if table doesn't exist
      if (error.message.includes("does not exist")) {
        return res.status(404).json({ error: "Table not found" });
      }
      throw new Error(error.message);
    }

    return res.json({ 
      table: tableName,
      type: 'sql',
      rows: data || [],
      count: data?.length || 0 
    });
  } catch (err) {
    logError("Get table data failed", { error: err.message, table: req.params.tableName });
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/download/:filename - Download file from Supabase storage
export const downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    logInfo("Download file endpoint hit", { filename });

    // Get file record to find storage path
    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .select("storage_path, filename")
      .eq("filename", filename)
      .single();

    if (dbError || !fileRecord) {
      return res.status(404).json({ error: "File not found in database" });
    }

    // Download file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from("smartstorage")
      .download(fileRecord.storage_path);

    if (downloadError || !fileData) {
      logError("Failed to download file", { error: downloadError?.message });
      return res.status(500).json({ error: "Failed to download file from storage" });
    }

    // Convert blob to buffer and send as response
    const buffer = Buffer.from(await fileData.arrayBuffer());
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.filename}"`);
    res.setHeader('Content-Type', fileData.type || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);
    
    return res.send(buffer);
  } catch (err) {
    logError("Download file failed", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
};
