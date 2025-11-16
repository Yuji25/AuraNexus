import { logInfo, logError, logSuccess } from "../utils/logger.util.js";
import { processMediaFiles } from "../services/upload.service.js";

export const handleMediaUpload = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    logInfo("Media upload endpoint hit", { fileCount: files.length });

    if (!files || files.length === 0) {
      logError("No files received");
      return res.status(400).json({ error: "No files uploaded." });
    }

    const result = await processMediaFiles(files);
    logSuccess("Media upload processed");
    return res.json(result);
  } catch (err) {
    logError("Upload controller error", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
};
