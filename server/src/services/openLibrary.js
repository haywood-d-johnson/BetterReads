import db from "../db/connection.js";
import config from "../config.js";
import { throttledFetch } from "../middleware/rateLimiter.js";

const TTL = { search: 60, work: 10080, edition: 10080, author: 10080, authorWorks: 1440 };

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
  const response = await throttledFetch(url, config.OL_USER_AGENT);
  if (!response.ok) throw new Error(`Open Library API error: ${response.status}`);
  const data = await response.json();
  await setCache(cacheKey, data, ttlMinutes);
  return data;
}

export async function searchBooks(query, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const cacheKey = `search:${query}:${page}:${limit}`;
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&fields=key,title,author_name,author_key,first_publish_year,cover_i,number_of_pages_median,subject,edition_count,isbn`;
  return cachedFetch(cacheKey, url, TTL.search);
}

export async function getWork(olWorkKey) {
  const key = olWorkKey.replace("/works/", "");
  return cachedFetch(`work:${key}`, `https://openlibrary.org/works/${key}.json`, TTL.work);
}

export async function getEdition(olEditionKey) {
  const key = olEditionKey.replace("/books/", "");
  return cachedFetch(`edition:${key}`, `https://openlibrary.org/books/${key}.json`, TTL.edition);
}

export async function getAuthor(olAuthorKey) {
  const key = olAuthorKey.replace("/authors/", "");
  return cachedFetch(`author:${key}`, `https://openlibrary.org/authors/${key}.json`, TTL.author);
}

export async function getAuthorWorks(olAuthorKey, page = 1, limit = 20) {
  const key = olAuthorKey.replace("/authors/", "");
  const offset = (page - 1) * limit;
  return cachedFetch(
    `author-works:${key}:${page}:${limit}`,
    `https://openlibrary.org/authors/${key}/works.json?limit=${limit}&offset=${offset}`,
    TTL.authorWorks,
  );
}

export async function getEditionByISBN(isbn) {
  const clean = isbn.replace(/[-\s]/g, "");
  return cachedFetch(`isbn:${clean}`, `https://openlibrary.org/isbn/${clean}.json`, TTL.edition);
}

export async function cleanupCache() {
  const result = await db.execute("DELETE FROM ol_cache WHERE expires_at < datetime('now')");
  if (result.rowsAffected > 0) console.log(`Cleaned up ${result.rowsAffected} expired cache entries.`);
}
