import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import db from "../db/connection.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const result = await db.execute(
      "SELECT s.*, COUNT(b.id) as book_count FROM shelf s LEFT JOIN book b ON b.shelf_id = s.id GROUP BY s.id ORDER BY s.sort_order ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shelves" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Shelf name is required" });
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const maxResult = await db.execute("SELECT MAX(sort_order) as max FROM shelf");
    const maxOrder = maxResult.rows[0].max || 0;
    const result = await db.execute({
      sql: "INSERT INTO shelf (name, slug, is_default, sort_order) VALUES (?, ?, 0, ?)",
      args: [name, slug, maxOrder + 1],
    });
    const newShelf = await db.execute({
      sql: "SELECT * FROM shelf WHERE id = ?",
      args: [Number(result.lastInsertRowid)],
    });
    res.status(201).json(newShelf.rows[0]);
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE"))
      return res.status(409).json({ error: "Shelf name already exists" });
    console.error(err);
    res.status(500).json({ error: "Failed to create shelf" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const shelfResult = await db.execute({
      sql: "SELECT * FROM shelf WHERE id = ?",
      args: [Number(req.params.id)],
    });
    const shelf = shelfResult.rows[0];
    if (!shelf) return res.status(404).json({ error: "Shelf not found" });
    if (shelf.is_default) return res.status(403).json({ error: "Cannot rename default shelves" });
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Shelf name is required" });
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    await db.execute({
      sql: "UPDATE shelf SET name = ?, slug = ? WHERE id = ?",
      args: [name, slug, shelf.id],
    });
    const updated = await db.execute({
      sql: "SELECT * FROM shelf WHERE id = ?",
      args: [shelf.id],
    });
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update shelf" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const shelfResult = await db.execute({
      sql: "SELECT * FROM shelf WHERE id = ?",
      args: [Number(req.params.id)],
    });
    const shelf = shelfResult.rows[0];
    if (!shelf) return res.status(404).json({ error: "Shelf not found" });
    if (shelf.is_default) return res.status(403).json({ error: "Cannot delete default shelves" });
    const wtr = await db.execute("SELECT id FROM shelf WHERE slug = 'want-to-read'");
    await db.execute({
      sql: "UPDATE book SET shelf_id = ? WHERE shelf_id = ?",
      args: [wtr.rows[0].id, shelf.id],
    });
    await db.execute({ sql: "DELETE FROM shelf WHERE id = ?", args: [shelf.id] });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete shelf" });
  }
});

export default router;
