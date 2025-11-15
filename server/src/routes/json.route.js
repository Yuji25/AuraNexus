import express from "express";
import { handleJsonUpload } from "../controllers/json.controller.js";

const router = express.Router();

router.post("/upload-json", handleJsonUpload);

export default router;
