import express from "express";
import { handleMediaUpload } from "../controllers/upload.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// accept multiple files; frontend uses key 'files' (form-data)
router.post("/upload", upload.array("files", 10), handleMediaUpload);

export default router;
