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

  // Strip all SQL comments, then split into individual statements
  const cleaned = schema
    .replace(/--.*$/gm, "") // remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, ""); // remove multi-line comments

  const statements = cleaned
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  await db.batch(statements.map((sql) => ({ sql: sql + ";", args: [] })));

  // Apply column additions for existing databases
  await applyAlterMigrations();

  // Rename "Abandoned" shelf to "Did Not Finish"
  await applyShelfRenames();

  // Move legacy single-location data into the book_location table
  await migrateLocationsToTable();

  console.log("Database migration complete.");
}

// One-time backfill: copy any book.location_* value into book_location, then
// clear the old columns so it isn't re-migrated on the next run.
async function migrateLocationsToTable() {
  try {
    const result = await db.execute(
      "SELECT id, location_name, location_lat, location_lng FROM book WHERE location_name IS NOT NULL AND location_lat IS NOT NULL AND location_lng IS NOT NULL",
    );
    for (const row of result.rows) {
      const existing = await db.execute({
        sql: "SELECT COUNT(*) as c FROM book_location WHERE book_id = ?",
        args: [row.id],
      });
      if (existing.rows[0].c === 0) {
        await db.execute({
          sql: "INSERT INTO book_location (book_id, name, lat, lng, note) VALUES (?, ?, ?, ?, NULL)",
          args: [row.id, row.location_name, row.location_lat, row.location_lng],
        });
      }
      await db.execute({
        sql: "UPDATE book SET location_name = NULL, location_lat = NULL, location_lng = NULL WHERE id = ?",
        args: [row.id],
      });
    }
  } catch (err) {
    console.error("Location backfill skipped:", err.message);
  }
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
