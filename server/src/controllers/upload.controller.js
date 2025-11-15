import { logError, logInfo, logSuccess } from "../utils/logger.util.js";
import { processMediaFiles } from "../services/upload.service.js";

export const handleMediaUpload = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    
    logInfo("Media upload endpoint hit", { fileCount: files.length });

    if (!files || files.length === 0) {
      logError("No files received");
      return res.status(400).json({ error: "No files uploaded." });
    }

    const response = await processMediaFiles(files);

    logSuccess("Files processed successfully", { count: files.length });
    return res.json(response);

  } catch (err) {
    logError("Upload controller error", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
