import "dotenv/config";
import express from "express";
import cors from "cors";
import certificatesRouter from "./src/routes/certificates.js";

const PORT = 4500;
const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "*", // Tighten in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Certificate Generator API is running." });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/certificates", certificatesRouter);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Certificate Generator API running at http://localhost:${PORT}`);
  console.log(`   Base URL: http://localhost:${PORT}/api`);
});