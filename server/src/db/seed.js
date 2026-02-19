import bcrypt from "bcryptjs";
import db from "./connection.js";
import { migrate } from "./migrate.js";
import config from "../config.js";

const SALT_ROUNDS = 12;

const DEFAULT_SHELVES = [
  { name: "Want to Read", slug: "want-to-read", sort_order: 0 },
  { name: "Currently Reading", slug: "currently-reading", sort_order: 1 },
  { name: "Finished", slug: "finished", sort_order: 2 },
  { name: "Did Not Finish", slug: "did-not-finish", sort_order: 3 },
];

export async function seed() {
  // Run migrations first to ensure tables exist
  await migrate();

  // Seed user (only if no users exist)
  const existingUser = await db.execute("SELECT id FROM user LIMIT 1");
  if (existingUser.rows.length === 0) {
    const hash = await bcrypt.hash(config.ADMIN_PASSWORD, SALT_ROUNDS);
    await db.execute({
      sql: "INSERT INTO user (username, password_hash) VALUES (?, ?)",
      args: [config.ADMIN_USERNAME, hash],
    });
    console.log(`Admin user "${config.ADMIN_USERNAME}" created.`);
  } else {
    console.log("User already exists, skipping user seed.");
  }

  // Seed default shelves (only if no shelves exist)
  const existingShelf = await db.execute("SELECT id FROM shelf LIMIT 1");
  if (existingShelf.rows.length === 0) {
    await db.batch(
      DEFAULT_SHELVES.map((shelf) => ({
        sql: "INSERT INTO shelf (name, slug, is_default, sort_order) VALUES (?, ?, 1, ?)",
        args: [shelf.name, shelf.slug, shelf.sort_order],
      })),
    );
    console.log("Default shelves created.");
  } else {
    console.log("Shelves already exist, skipping shelf seed.");
  }
}

// Allow running directly: node src/db/seed.js
const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));

if (isDirectRun) {
  seed()
    .then(() => {
      console.log("Seed complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
