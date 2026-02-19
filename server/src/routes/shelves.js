import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import db from "../db/connection.js";

const router = Router();

router.get("/", authenticate, (req, res) => {
  try {
    res.json(
      db
        .prepare(
          "SELECT s.*, COUNT(b.id) as book_count FROM shelf s LEFT JOIN book b ON b.shelf_id = s.id GROUP BY s.id ORDER BY s.sort_order ASC",
        )
        .all(),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shelves" });
  }
});

router.post("/", authenticate, (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Shelf name is required" });
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const maxOrder = db.prepare("SELECT MAX(sort_order) as max FROM shelf").get().max || 0;
    const result = db
      .prepare("INSERT INTO shelf (name, slug, is_default, sort_order) VALUES (?, ?, 0, ?)")
      .run(name, slug, maxOrder + 1);
    res.status(201).json(db.prepare("SELECT * FROM shelf WHERE id = ?").get(result.lastInsertRowid));
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE"))
      return res.status(409).json({ error: "Shelf name already exists" });
    console.error(err);
    res.status(500).json({ error: "Failed to create shelf" });
  }
});

router.put("/:id", authenticate, (req, res) => {
  try {
    const shelf = db.prepare("SELECT * FROM shelf WHERE id = ?").get(Number(req.params.id));
    if (!shelf) return res.status(404).json({ error: "Shelf not found" });
    if (shelf.is_default) return res.status(403).json({ error: "Cannot rename default shelves" });
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Shelf name is required" });
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    db.prepare("UPDATE shelf SET name = ?, slug = ? WHERE id = ?").run(name, slug, shelf.id);
    res.json(db.prepare("SELECT * FROM shelf WHERE id = ?").get(shelf.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update shelf" });
  }
});

router.delete("/:id", authenticate, (req, res) => {
  try {
    const shelf = db.prepare("SELECT * FROM shelf WHERE id = ?").get(Number(req.params.id));
    if (!shelf) return res.status(404).json({ error: "Shelf not found" });
    if (shelf.is_default) return res.status(403).json({ error: "Cannot delete default shelves" });
    const wtr = db.prepare("SELECT id FROM shelf WHERE slug = 'want-to-read'").get();
    db.prepare("UPDATE book SET shelf_id = ? WHERE shelf_id = ?").run(wtr.id, shelf.id);
    db.prepare("DELETE FROM shelf WHERE id = ?").run(shelf.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete shelf" });
  }
});

export default router;
