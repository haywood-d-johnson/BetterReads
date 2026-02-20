import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as bookService from "../services/bookService.js";
import * as openLibrary from "../services/openLibrary.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const { shelf, sort, order, page = 1, limit = 20, reader } = req.query;
    res.json(await bookService.getBooks({ shelfSlug: shelf, reader, sort, order, page: Number(page), limit: Number(limit) }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.get("/library-keys", authenticate, async (req, res) => {
  try {
    res.json({ keys: await bookService.getLibraryWorkKeys() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch library keys" });
  }
});

router.get("/ol/:olWorkKey", authenticate, async (req, res) => {
  try {
    const olWorkKey = `/works/${req.params.olWorkKey}`;
    const localBook = await bookService.getBookByWorkKey(olWorkKey);
    const work = await openLibrary.getWork(olWorkKey);
    const description = typeof work.description === "string" ? work.description : work.description?.value || null;
    const coverId = work.covers?.[0] || null;
    const subjects = work.subjects?.slice(0, 15) || [];
    const authorKeys = work.authors?.map((a) => a.author?.key) || [];
    let authorName = null;
    if (authorKeys[0]) {
      try {
        const author = await openLibrary.getAuthor(authorKeys[0]);
        authorName = author.name || null;
      } catch {}
    }
    res.json({
      ol_work_key: olWorkKey,
      title: work.title || "Unknown Title",
      subtitle: work.subtitle || null,
      author_name: authorName,
      ol_author_key: authorKeys[0] || null,
      cover_id: coverId,
      description,
      subjects,
      first_publish_date: work.first_publish_date || null,
      in_library: !!localBook,
      local_book: localBook || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Open Library work" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const book = await bookService.getBook(Number(req.params.id));
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    res.status(201).json(await bookService.addBook(req.body));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add book" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const book = await bookService.updateBook(Number(req.params.id), req.body);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    await bookService.deleteBook(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

router.put("/:id/shelf", authenticate, async (req, res) => {
  try {
    const book = await bookService.moveShelf(Number(req.params.id), req.body.shelfId);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to move book" });
  }
});

router.put("/:id/progress", authenticate, async (req, res) => {
  try {
    const book = await bookService.updateProgress(Number(req.params.id), req.body.currentPage);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

router.put("/:id/rating", authenticate, async (req, res) => {
  try {
    const book = await bookService.updateRating(Number(req.params.id), req.body.rating);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update rating" });
  }
});

router.put("/:id/review", authenticate, async (req, res) => {
  try {
    const book = await bookService.updateReview(Number(req.params.id), req.body.review);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

router.put("/:id/reader", authenticate, async (req, res) => {
  try {
    const { reader } = req.body;
    if (reader !== "me" && reader !== "kids") {
      return res.status(400).json({ error: "reader must be 'me' or 'kids'" });
    }
    const book = await bookService.updateReader(Number(req.params.id), reader);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update reader" });
  }
});

router.put("/:id/location", authenticate, async (req, res) => {
  try {
    const { locationName, locationLat, locationLng } = req.body;
    if (!locationName || locationLat == null || locationLng == null) {
      return res.status(400).json({ error: "locationName, locationLat, and locationLng are required" });
    }
    const book = await bookService.updateLocation(Number(req.params.id), locationName, Number(locationLat), Number(locationLng));
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update location" });
  }
});

router.delete("/:id/location", authenticate, async (req, res) => {
  try {
    const book = await bookService.removeLocation(Number(req.params.id));
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove location" });
  }
});

router.get("/:id/progress-history", authenticate, async (req, res) => {
  try {
    res.json(await bookService.getProgressHistory(Number(req.params.id)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch progress history" });
  }
});

export default router;
