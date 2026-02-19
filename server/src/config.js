import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root (one level above server/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  DB_PATH: process.env.DB_PATH || "./server/data/betterreads.db",
  OL_USER_AGENT: process.env.OL_USER_AGENT || "BetterReads/1.0 (personal book tracker)",
};

// Validate required env vars
if (!config.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in .env");
  process.exit(1);
}

if (!config.ADMIN_PASSWORD) {
  console.error("FATAL: ADMIN_PASSWORD is not set in .env");
  process.exit(1);
}

export default config;
