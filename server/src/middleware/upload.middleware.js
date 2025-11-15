import multer from "multer";
import { logError, logInfo } from "../utils/logger.util.js";

const storage = multer.memoryStorage(); // stores file in memory

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    logInfo("Received file", { filename: file.originalname, mimetype: file.mimetype });
    cb(null, true); // we are allowing all file types as we have to handle various types
  }
});
