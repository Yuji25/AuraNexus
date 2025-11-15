export const detectFileType = (mime) => {
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("video")) return "video";
  if (mime.includes("image")) return "image";
  return "other";
};
