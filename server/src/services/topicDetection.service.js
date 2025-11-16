import { logInfo } from "../utils/logger.util.js";


export const detectTopic = async (filename, text) => {
  logInfo("Running placeholder topic detection...");

  let combined = (filename + " " + text).toLowerCase();
  combined = combined.toLowerCase();




  if (combined.includes("game") || combined.includes("gamer") || combined.includes("games"))
    return "Gaming";
  if (combined.includes("cook") || combined.includes("recipe"))
    return "Cooking";

  return "General";
};
