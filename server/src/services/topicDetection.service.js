import { logInfo } from "../utils/logger.util.js";

// Simple placeholder for now
export const detectTopic = async (filename, text) => {
  logInfo("Running placeholder topic detection...");

  let combined = (filename + " " + text).toLowerCase();
  combined = combined.toLowerCase();

  // console.log("Extracted Text:", combined.slice(0, 1000)); // Log first 100 characters


  if (combined.includes("game") || combined.includes("gamer") || combined.includes("games"))
    return "Gaming";
  if (combined.includes("cook") || combined.includes("recipe"))
    return "Cooking";

  return "General";
};
