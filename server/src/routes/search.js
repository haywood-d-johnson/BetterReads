import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as openLibrary from "../services/openLibrary.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ error: "Query parameter q is required" });
    const data = await openLibrary.searchBooks(q, Number(page), Number(limit));
    res.json(data);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/work/:olWorkKey", authenticate, async (req, res) => {
  try {
    res.json(await openLibrary.getWork(req.params.olWorkKey));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch work" });
  }
});

router.get("/edition/:olEditionKey", authenticate, async (req, res) => {
  try {
    res.json(await openLibrary.getEdition(req.params.olEditionKey));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch edition" });
  }
});

router.get("/isbn/:isbn", authenticate, async (req, res) => {
  try {
    const isbn = req.params.isbn.replace(/[-\s]/g, "");
    if (!/^\d{10}(\d{3})?$/.test(isbn)) {
      return res.status(400).json({ error: "Invalid ISBN format" });
    }
    const edition = await openLibrary.getEditionByISBN(isbn);
    const workKey = edition.works?.[0]?.key;
    if (!workKey) {
      return res.status(404).json({ error: "No work found for this ISBN" });
    }
    res.json({ ol_work_key: workKey, isbn });
  } catch (err) {
    console.error("ISBN lookup error:", err);
    if (err.message?.includes("404")) {
      return res.status(404).json({ error: "ISBN not found in Open Library" });
    }
    res.status(500).json({ error: "ISBN lookup failed" });
  }
});

export default router;
