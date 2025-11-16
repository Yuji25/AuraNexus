import express from "express";
import cors from "cors";
import { supabase } from "./config/supabaseClient.js";
import dotenv from "dotenv";
dotenv.config();

// Importing routes
import uploadRoutes from "./routes/upload.route.js";
import jsonRoutes from "./routes/json.route.js";
import dataRoutes from "./routes/data.route.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Default and Health Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/test-db", async (req, res) => {
  const { data, error } = await supabase.from("test_table").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// Main routes
app.use("/api", uploadRoutes);
app.use("/api", jsonRoutes);
app.use("/api", dataRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
