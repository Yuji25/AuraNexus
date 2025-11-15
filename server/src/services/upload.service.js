import { supabase } from "../config/supabaseClient.js";
import { logError, logInfo, logSuccess } from "../utils/logger.util.js";
import { extractTextFromPDF } from "../utils/textExtract.util.js";
import { detectFileType } from "../utils/fileType.util.js";
import { detectTopic } from "./topicDetection.service.js";
import { sanitizeFileName } from "../utils/sanitize.util.js";

export const processMediaFiles = async (files) => {
  const results = [];

  for (const file of files) {
    try {
      logInfo("Processing file", { name: file.originalname });

      // Step 1: detect file type
      const fileType = detectFileType(file.mimetype);
      logInfo("Detected file type", { fileType });

      // Step 2: extract text for topic detection
      let text = "";

      if (fileType === "pdf") {
        text = await extractTextFromPDF(file.buffer);
        logInfo("Extracted PDF text", { length: text.length });
      }


      // (Video/image extraction will be added later)
      
      // Step 3: topic detection
      const topic = await detectTopic(file.originalname, text);
      logInfo("Detected topic", { topic });


      // Step 4: Build folder path: /topic/filetype/
      const folderPath = `${fileType}/${topic}`;
      const safeName = sanitizeFileName(file.originalname)
      const storagePath = `${folderPath}/${Date.now()}_${safeName}`;

      // Step 5: Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("smartstorage")
        .upload(storagePath, file.buffer);

      if (uploadError) {
        logError("Storage upload failed", { error: uploadError.message });
        throw new Error(uploadError.message);
      }

      logSuccess("File uploaded to Supabase", { storagePath });

      // Step 6: Save record in DB
      const { error: dbError } = await supabase
        .from("files")
        .insert({
          filename: file.originalname,
          topic,
          file_type: fileType,
          storage_path: storagePath,
        });

      if (dbError) {
        logError("DB insert failed", { error: dbError.message });
        throw new Error(dbError.message);
      }

      results.push({ file: file.originalname, topic, storagePath });

    } catch (err) {
      logError("Error processing file", { file: file.originalname, error: err.message });
      results.push({ file: file.originalname, error: err.message });
    }
  }

  return { results };
};
