export const handleJsonUpload = async (req, res) => {
  try {
    
    // Temporary placeholder
    return res.json({ message: "JSON upload endpoint working!" });
  } catch (err) {
    console.error("JSON upload error:", err);
    res.status(500).json({ error: err.message });
  }
};
