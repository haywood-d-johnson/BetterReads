import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyAlterMigrations() {
  const alterStatements = [
    "ALTER TABLE book ADD COLUMN location_name TEXT",
    "ALTER TABLE book ADD COLUMN location_lat REAL",
    "ALTER TABLE book ADD COLUMN location_lng REAL",
    "ALTER TABLE book ADD COLUMN reader TEXT DEFAULT 'me'",
  ];

  for (const sql of alterStatements) {
    try {
      await db.execute(sql);
    } catch (err) {
      // Column already exists — safe to ignore
      if (!err.message.includes("duplicate column name")) {
        throw err;
      }
    }
  }
}

export async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Split schema into individual statements and execute as a batch
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  await db.batch(statements.map((sql) => ({ sql: sql + ";" })));

  // Apply column additions for existing databases
  await applyAlterMigrations();

  // Rename "Abandoned" shelf to "Did Not Finish"
  await applyShelfRenames();

  console.log("Database migration complete.");
}

async function applyShelfRenames() {
  try {
    await db.execute({
      sql: "UPDATE shelf SET name = ?, slug = ? WHERE slug = ?",
      args: ["Did Not Finish", "did-not-finish", "abandoned"],
    });
  } catch {
    // ignore if shelf doesn't exist
  }
}
