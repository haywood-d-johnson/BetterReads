import express from "express";
import cors from "cors";
import config from "./config.js";
import { seed } from "./db/seed.js";
import { cleanupCache } from "./services/openLibrary.js";
import authRoutes from "./routes/auth.js";
import searchRoutes from "./routes/search.js";
import bookRoutes from "./routes/books.js";
import shelfRoutes from "./routes/shelves.js";
import authorRoutes from "./routes/authors.js";
import statsRoutes from "./routes/stats.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/shelves", shelfRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/stats", statsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Initialize database (runs migration + seed on cold start)
let initialized = false;
export async function ensureInitialized() {
  if (initialized) return;
  await seed(); // seed() calls migrate() internally
  await cleanupCache();
  initialized = true;
}

// Local dev: start server with app.listen()
// In Vercel serverless, this file is imported but start() never runs
const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (isDirectRun) {
  (async () => {
    try {
      await ensureInitialized();

      // Only run periodic cleanup in long-running server mode
      setInterval(() => cleanupCache().catch(console.error), 60 * 60 * 1000);

      app.listen(config.PORT, () => {
        console.log(`BetterReads server running on http://localhost:${config.PORT}`);
      });
    } catch (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
  })();
}

export default app;
