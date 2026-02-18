import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { profileRouter } from "./routes/profile.js";

const app = express();
const port = process.env.PORT || 3001;

// CORS — must be before routes, credentials: true for cookies
const origins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3000",
      "https://abdulrehman346790.github.io",
    ];

app.use(
  cors({
    origin: origins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// better-auth handler — MUST be before express.json()
app.all("/api/auth/*", toNodeHandler(auth));

// express.json() AFTER better-auth handler (critical: avoids hanging)
app.use(express.json());

// Custom routes
app.use("/api/profile", profileRouter(auth));

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    res.json({ status: "ok", service: "auth-server" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Auth server running on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`Auth check: http://localhost:${port}/api/auth/ok`);
});
