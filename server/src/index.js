import express from "express";
import cors from "cors";
import config from "./config.js";
import { migrate } from "./db/migrate.js";
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

// Initialize database and start server
async function start() {
  try {
    migrate();
    await seed();

    // Clean up expired cache entries on startup and every hour
    cleanupCache();
    setInterval(cleanupCache, 60 * 60 * 1000);

    app.listen(config.PORT, () => {
      console.log(`BetterReads server running on http://localhost:${config.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
