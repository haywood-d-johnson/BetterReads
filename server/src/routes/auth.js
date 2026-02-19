import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/connection.js";
import config from "../config.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find user by username
    const user = db.prepare("SELECT id, username, password_hash FROM user WHERE username = ?").get(username);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password with stored hash
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, username: user.username }, config.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me — validate token and return user info
router.get("/me", authenticate, (req, res) => {
  const user = db.prepare("SELECT id, username, created_at FROM user WHERE id = ?").get(req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});

export default router;
