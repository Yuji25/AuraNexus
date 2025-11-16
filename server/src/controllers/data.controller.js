import { supabase } from "../config/supabaseClient.js";
import { logError, logInfo } from "../utils/logger.util.js";


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


export const getSchemas = async (req, res) => {
  try {
    logInfo("Schemas endpoint hit");
    

    const { data: sqlSchemas, error: sqlError } = await supabase
      .from("schemas")
      .select("*")
      .order("created_at", { ascending: false });

    if (sqlError) throw new Error(sqlError.message);


    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select("id, created_at")
      .order("created_at", { ascending: false });

    if (docsError) {
      logError("Failed to get NoSQL documents", { error: docsError.message });
    }

    const schemas = [...(sqlSchemas || [])];

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

export const getTableData = async (req, res) => {
  try {
    const { tableName } = req.params;
    logInfo("Table data endpoint hit", { tableName });


    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).json({ error: "Invalid table name" });
    }

   
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


    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .limit(100);

    if (error) {

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


export const downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    logInfo("Download file endpoint hit", { filename });


    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .select("storage_path, filename, file_type")
      .eq("filename", filename)
      .single();

    if (dbError || !fileRecord) {
      return res.status(404).json({ error: "File not found in database" });
    }


    const { data: signedUrlData, error: urlError } = await supabase
      .storage
      .from("smartstorage")
      .createSignedUrl(fileRecord.storage_path, 300); // 5 minutes expiry

    if (urlError || !signedUrlData?.signedUrl) {
      logError("Failed to generate signed URL", { error: urlError?.message });
      return res.status(500).json({ error: "Failed to generate download URL" });
    }


    return res.json({ 
      downloadUrl: signedUrlData.signedUrl,
      filename: fileRecord.filename,
      fileType: fileRecord.file_type
    });
  } catch (err) {
    logError("Download file failed", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
};


export const downloadFileProxy = async (req, res) => {
  try {
    const { filename } = req.params;
    logInfo("Download proxy endpoint hit", { filename });


    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .select("storage_path, filename, file_type")
      .eq("filename", filename)
      .single();

    if (dbError || !fileRecord) {
      return res.status(404).json({ error: "File not found in database" });
    }


    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from("smartstorage")
      .download(fileRecord.storage_path);

    if (downloadError || !fileData) {
      logError("Failed to download file", { error: downloadError?.message });
      return res.status(500).json({ error: "Failed to download file from storage" });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    

    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.filename}"`);
    res.setHeader('Content-Type', fileData.type || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    return res.send(buffer);
  } catch (err) {
    logError("Download proxy failed", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
};


export const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    logInfo("Delete file endpoint hit", { filename });


    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .select("storage_path, filename")
      .eq("filename", filename)
      .single();

    if (dbError || !fileRecord) {
      return res.status(404).json({ error: "File not found in database" });
    }

    const { error: storageError } = await supabase
      .storage
      .from("smartstorage")
      .remove([fileRecord.storage_path]);

    if (storageError) {
      logError("Failed to delete from storage", { error: storageError.message });
    }

    const { error: deleteError } = await supabase
      .from("files")
      .delete()
      .eq("filename", filename);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return res.json({ message: "File deleted successfully", filename });
  } catch (err) {
    logError("Delete file failed", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
};


export const deleteSchema = async (req, res) => {
  try {
    const { tableName } = req.params;
    logInfo("Delete schema endpoint hit", { tableName });

    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).json({ error: "Invalid table name" });
    }


    if (tableName.startsWith('document_')) {
      const docId = tableName.replace('document_', '');
      
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", docId);

      if (error) {
        throw new Error(error.message);
      }

      return res.json({ message: "Document deleted successfully", tableName });
    }

    const { error: schemaError } = await supabase
      .from("schemas")
      .delete()
      .eq("table_name", tableName);

    if (schemaError) {
      logError("Failed to delete schema", { error: schemaError.message });
    }

    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `DROP TABLE IF EXISTS ${tableName};`
    });

    if (dropError) {
      logError("Failed to drop table", { error: dropError.message });
      throw new Error(dropError.message);
    }

    return res.json({ message: "Schema and table deleted successfully", tableName });
  } catch (err) {
    logError("Delete schema failed", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
};
