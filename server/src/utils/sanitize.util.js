export const sanitizeFileName = (filename) => {
  if (!filename || typeof filename !== "string") return "file";

  const base = filename.split("/").pop().split("\\").pop();
  
  const safe = base.replace(/[^a-zA-Z0-9.\-_]/g, "_").replace(/_+/g, "_");
 
  return safe.replace(/^\.+/, "");
};

export const sanitizePathSegment = (name) => {
  if (!name || typeof name !== "string") return "unknown";
  return name.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_");
};

export const escapeSingleQuotes = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/'/g, "''");
};