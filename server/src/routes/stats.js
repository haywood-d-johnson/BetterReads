import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as statsService from "../services/statsService.js";

const router = Router();

router.get("/overview", authenticate, (req, res) => {
  try {
    res.json(statsService.getOverview(req.query.reader));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/by-year", authenticate, (req, res) => {
  try {
    res.json(statsService.getByYear(req.query.year || new Date().getFullYear(), req.query.reader));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch yearly stats" });
  }
});

router.get("/genres", authenticate, (req, res) => {
  try {
    res.json(statsService.getGenres(req.query.reader));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch genre stats" });
  }
});

router.get("/ratings", authenticate, (req, res) => {
  try {
    res.json(statsService.getRatings(req.query.reader));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rating stats" });
  }
});

export default router;
