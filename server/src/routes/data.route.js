import express from "express";
import { getFiles, getSchemas, getTableData, downloadFile } from "../controllers/data.controller.js";

const router = express.Router();

router.get("/files", getFiles);
router.get("/schemas", getSchemas);
router.get("/data/:tableName", getTableData);
router.get("/download/:filename", downloadFile);

export default router;
