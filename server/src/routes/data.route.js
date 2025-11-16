import express from "express";
import { getFiles, getSchemas, getTableData, downloadFile, downloadFileProxy } from "../controllers/data.controller.js";

const router = express.Router();

router.get("/files", getFiles);
router.get("/schemas", getSchemas);
router.get("/data/:tableName", getTableData);
router.get("/download/:filename", downloadFile);
router.get("/download-proxy/:filename", downloadFileProxy);

export default router;
