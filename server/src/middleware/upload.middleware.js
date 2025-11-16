import multer from "multer";
import { logInfo } from "../utils/logger.util.js";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
  fileFilter: (req, file, cb) => {
    logInfo("Received file", { filename: file.originalname, mimetype: file.mimetype });
    cb(null, true); // we are allowing all file types as we have to handle various types
  }
});
