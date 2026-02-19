import jwt from "jsonwebtoken";
import config from "../config.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.slice(7); // Remove "Bearer " prefix

  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.userId = payload.userId;
    req.username = payload.username;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
