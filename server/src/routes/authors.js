import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as openLibrary from "../services/openLibrary.js";

const router = Router();

router.get("/:olAuthorKey", authenticate, async (req, res) => {
  try {
    res.json(await openLibrary.getAuthor(req.params.olAuthorKey));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch author" });
  }
});

router.get("/:olAuthorKey/works", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    res.json(await openLibrary.getAuthorWorks(req.params.olAuthorKey, Number(page), Number(limit)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch author works" });
  }
});

export default router;
