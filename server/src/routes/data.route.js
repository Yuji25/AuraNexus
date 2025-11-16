import express from "express";
import { getFiles, getSchemas, getTableData, downloadFile, downloadFileProxy, deleteFile, deleteSchema } from "../controllers/data.controller.js";

const router = express.Router();

router.get("/files", getFiles);
router.get("/schemas", getSchemas);
router.get("/data/:tableName", getTableData);
router.get("/download/:filename", downloadFile);
router.get("/download-proxy/:filename", downloadFileProxy);
router.delete("/delete-file/:filename", deleteFile);
router.delete("/delete-schema/:tableName", deleteSchema);

export default router;
