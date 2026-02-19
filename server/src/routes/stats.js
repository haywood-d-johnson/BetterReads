import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as statsService from "../services/statsService.js";

const router = Router();

router.get("/overview", authenticate, async (req, res) => {
  try {
    res.json(await statsService.getOverview(req.query.reader));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/by-year", authenticate, async (req, res) => {
  try {
    res.json(await statsService.getByYear(req.query.year || new Date().getFullYear(), req.query.reader));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch yearly stats" });
  }
});

router.get("/genres", authenticate, async (req, res) => {
  try {
    res.json(await statsService.getGenres(req.query.reader));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch genre stats" });
  }
});

router.get("/ratings", authenticate, async (req, res) => {
  try {
    res.json(await statsService.getRatings(req.query.reader));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rating stats" });
  }
});

export default router;
