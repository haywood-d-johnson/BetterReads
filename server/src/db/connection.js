import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import config from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve DB path relative to the project root
const dbPath = path.resolve(__dirname, "../../../", config.DB_PATH);

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Enable foreign key enforcement (off by default in SQLite!)
db.pragma("foreign_keys = ON");

export default db;
