// src/services/upload.service.js
import { supabase } from "../config/supabaseClient.js";
import { logInfo, logError } from "../utils/logger.util.js";
import { classifyByExtension, extTriggersJsonPhase } from "../utils/fileType.util.js";
import { sanitizeFileName, sanitizePathSegment } from "../utils/sanitize.util.js";
import { processJSON } from "./json.service.js"; // Phase 2: must exist

// Helper: read buffer -> string safely (utf-8)
const bufferToString = (buffer) => {
  try {
    return buffer.toString("utf8");
  } catch (e) {
    return "";
  }
};

export const processMediaFiles = async (files) => {
  const results = [];

  for (const file of files) {
    try {
      logInfo("Processing file", { name: file.originalname, mimetype: file.mimetype });

      const originalName = file.originalname || "file";
      const safeName = sanitizeFileName(originalName);

      // classify by extension
      const parts = safeName.split(".");
      const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
      const { category, ext: extFolder } = classifyByExtension(safeName);

      // If extension triggers JSON-phase (.json always, .txt/.log maybe)
      if (extTriggersJsonPhase(ext)) {
        // Only .json always -> parse
        const text = bufferToString(file.buffer || Buffer.from([])).trim();

        // If ext is .json -> we try parse strictly
        // If ext is txt or log -> parse only if ENTIRE content is valid JSON
        let isJson = false;
        let parsed = null;

        if (ext === "json") {
          try {
            parsed = JSON.parse(text);
            isJson = true;
          } catch (e) {
            isJson = false;
          }
        } else if (ext === "txt" || ext === "log") {
          if (text.length === 0) {
            // empty text file: NOT JSON -> treat as normal txt
            isJson = false;
          } else {
            try {
              parsed = JSON.parse(text);
              isJson = true;
            } catch (e) {
              isJson = false;
            }
          }
        }

        if (isJson) {
          logInfo("File contains pure JSON — routing to JSON processor", { file: safeName });
          // Do NOT store the file; process via Phase2 JSON processor
          const jsonResult = await processJSON(parsed);
          results.push({ file: safeName, action: "json_processed", result: jsonResult });
          continue; // next file
        }
        // else fall-through to normal storage (txt/log that aren't valid JSON)
      }

      // Build storage path: /Category/Extension/<timestamp>_<sanitizedName>
      const timestamp = Date.now();
      const safeCategory = sanitizePathSegment(category);
      const safeExt = sanitizePathSegment(extFolder || (ext || "unknown"));
      const storagePath = `${safeCategory}/${safeExt}/${timestamp}_${safeName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("smartstorage")
        .upload(storagePath, file.buffer);

      if (uploadError) {
        logError("Storage upload failed", { error: uploadError.message, path: storagePath });
        throw new Error(uploadError.message);
      }

      // Insert metadata row in files table
      const insertObj = {
        filename: safeName,
        file_type: ext || "",
        storage_path: storagePath
      };

      const { error: dbError } = await supabase.from("files").insert([insertObj]);

      if (dbError) {
        logError("DB insert failed", { error: dbError.message });
        throw new Error(dbError.message);
      }

      results.push({ file: safeName, action: "stored", storagePath });

    } catch (err) {
      logError("Error processing file", { file: file.originalname, error: err.message });
      results.push({ file: file.originalname || "unknown", error: err.message });
    }
  }

  return { results };
};