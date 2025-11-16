export const sanitizeIdentifier = (name) => {
  if (!name || typeof name !== "string") return "_";
  let safe = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  if (!/^[a-z_]/.test(safe)) safe = "_" + safe;
  return safe.replace(/_+/g, "_");
};


export const escapeSingleQuotes = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/'/g, "''");
};