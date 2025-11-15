export const sanitizeFileName = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")   // replace non-safe chars with _
    .replace(/_+/g, "_")                 // compress repeated underscores
    .toLowerCase();
};