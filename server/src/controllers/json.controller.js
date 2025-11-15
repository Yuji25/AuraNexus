import { logInfo, logError } from "../utils/logger.util.js";
import { processJSON } from "../services/json.service.js";

// Accepts either:
// 1. Raw JSON body (object or array) with Content-Type: application/json
// 2. A string field `json` containing stringified JSON (legacy form-encoded or multipart)
export const handleJsonUpload = async (req, res) => {
  try {
    logInfo("JSON upload endpoint hit");

    let payload;

    // Case 1: Field named json provided (string or already parsed)
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, "json")) {
      const candidate = req.body.json;
      if (typeof candidate === "string") {
        try {
          payload = JSON.parse(candidate);
        } catch (err) {
          return res.status(400).json({ error: "Invalid JSON format in 'json' field" });
        }
      } else {
        // Already parsed (e.g., client sent {"json": {...}} as JSON)
        payload = candidate;
      }
    }
    // Case 2: Raw body is an object/array (preferred)
    else if (Array.isArray(req.body) || (req.body && typeof req.body === "object")) {
      payload = req.body; // Express.json() already parsed it
    }

    if (payload === undefined) {
      return res.status(400).json({ error: "No JSON provided. Send raw JSON or a 'json' field." });
    }

    const response = await processJSON(payload);
    return res.json(response);
  } catch (err) {
    logError("JSON upload failed", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
};
