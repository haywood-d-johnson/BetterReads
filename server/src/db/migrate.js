import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function applyAlterMigrations() {
  const alterStatements = [
    "ALTER TABLE book ADD COLUMN location_name TEXT",
    "ALTER TABLE book ADD COLUMN location_lat REAL",
    "ALTER TABLE book ADD COLUMN location_lng REAL",
    "ALTER TABLE book ADD COLUMN reader TEXT DEFAULT 'me'",
  ];

  for (const sql of alterStatements) {
    try {
      db.exec(sql);
    } catch (err) {
      // Column already exists — safe to ignore
      if (!err.message.includes("duplicate column name")) {
        throw err;
      }
    }
  }
}

export function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Execute all CREATE TABLE statements
  db.exec(schema);

  // Apply column additions for existing databases
  applyAlterMigrations();

  // Rename "Abandoned" shelf to "Did Not Finish"
  applyShelfRenames();

  console.log("Database migration complete.");
}

function applyShelfRenames() {
  try {
    db.prepare("UPDATE shelf SET name = ?, slug = ? WHERE slug = ?").run(
      "Did Not Finish",
      "did-not-finish",
      "abandoned",
    );
  } catch {
    // ignore if shelf doesn't exist
  }
}
