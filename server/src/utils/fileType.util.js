const IMAGE_EXTS = new Set(["jpg","jpeg","png","svg","gif","bmp","webp","tiff"]);
const VIDEO_EXTS = new Set(["mp4","mkv","mov","webm","avi","flv"]);
const AUDIO_EXTS = new Set(["mp3","wav","flac","ogg","aac"]);
const DOCUMENT_EXTS = new Set(["pdf","docx","pptx","xlsx","txt","json","log"]);

export const classifyByExtension = (filename) => {
  const parts = (filename || "").split(".");
  const rawExt = parts.length > 1 ? parts.pop() : "";
  const ext = rawExt ? rawExt.toLowerCase() : "";
  if (IMAGE_EXTS.has(ext)) return { category: "Images", ext: ext || "unknown" };
  if (VIDEO_EXTS.has(ext)) return { category: "Videos", ext: ext || "unknown" };
  if (AUDIO_EXTS.has(ext)) return { category: "Audio", ext: ext || "unknown" };
  if (DOCUMENT_EXTS.has(ext)) return { category: "Documents", ext: ext || "unknown" };
  // fallback: Other (Option C)
  return { category: "Other", ext: ext || "unknown" };
};

// quick helper to check if extension triggers Phase 2 JSON parsing
export const extTriggersJsonPhase = (ext) => {
  if (!ext) return false;
  const e = ext.toLowerCase();
  return e === "json" || e === "log" || e === "txt";
};