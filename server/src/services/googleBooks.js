import db from "../db/connection.js";
import config from "../config.js";
import { throttledFetch } from "../middleware/rateLimiter.js";

const TTL = { search: 60, volume: 10080 };
const BASE = "https://www.googleapis.com/books/v1";

async function getCached(cacheKey) {
  const result = await db.execute({
    sql: "SELECT response_json FROM ol_cache WHERE cache_key = ? AND expires_at > datetime('now')",
    args: [cacheKey],
  });
  return result.rows[0] ? JSON.parse(result.rows[0].response_json) : null;
}

async function setCache(cacheKey, data, ttlMinutes) {
  await db.execute({
    sql: `INSERT OR REPLACE INTO ol_cache (cache_key, response_json, cached_at, expires_at) VALUES (?, ?, datetime('now'), datetime('now', '+' || ? || ' minutes'))`,
    args: [cacheKey, JSON.stringify(data), ttlMinutes],
  });
}

async function cachedFetch(cacheKey, url, ttlMinutes) {
  const cached = await getCached(cacheKey);
  if (cached) return cached;
  const withKey = config.GOOGLE_BOOKS_API_KEY ? `${url}&key=${config.GOOGLE_BOOKS_API_KEY}` : url;
  const response = await throttledFetch(withKey, config.OL_USER_AGENT);
  if (!response.ok) throw new Error(`Google Books API error: ${response.status}`);
  const data = await response.json();
  await setCache(cacheKey, data, ttlMinutes);
  return data;
}

// Google Books caps maxResults at 40. `country` is required for the API to
// return volumes in many regions.
export async function searchVolumes(query, page = 1, limit = 20) {
  const maxResults = Math.min(limit, 40);
  const startIndex = (page - 1) * limit;
  const cacheKey = `gb:search:${query}:${page}:${limit}`;
  const url = `${BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}&country=US`;
  return cachedFetch(cacheKey, url, TTL.search);
}

export async function getVolume(volumeId) {
  const cacheKey = `gb:volume:${volumeId}`;
  const url = `${BASE}/volumes/${encodeURIComponent(volumeId)}?country=US`;
  return cachedFetch(cacheKey, url, TTL.volume);
}
