import db from "../db/connection.js";

export function getBooks({ shelfSlug, reader, sort = "date_added", order = "desc", page = 1, limit = 20 }) {
  let query = "SELECT b.*, s.name as shelf_name, s.slug as shelf_slug FROM book b JOIN shelf s ON b.shelf_id = s.id";
  const conditions = [];
  const params = [];
  if (shelfSlug) {
    conditions.push("s.slug = ?");
    params.push(shelfSlug);
  }
  if (reader === "me" || reader === "kids") {
    conditions.push("b.reader = ?");
    params.push(reader);
  }
  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  const countQuery = query.replace(
    "SELECT b.*, s.name as shelf_name, s.slug as shelf_slug",
    "SELECT COUNT(*) as total",
  );
  const { total } = db.prepare(countQuery).get(...params);
  const sortMap = {
    date_added: "b.date_added",
    title: "b.title",
    author: "b.author_name",
    author_name: "b.author_name",
    rating: "b.rating",
    date_finished: "b.date_finished",
  };
  query += ` ORDER BY ${sortMap[sort] || "b.date_added"} ${order === "asc" ? "ASC" : "DESC"}`;
  const offset = (page - 1) * limit;
  query += " LIMIT ? OFFSET ?";
  params.push(limit, offset);
  return { books: db.prepare(query).all(...params), total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function getBook(id) {
  return db
    .prepare(
      "SELECT b.*, s.name as shelf_name, s.slug as shelf_slug FROM book b JOIN shelf s ON b.shelf_id = s.id WHERE b.id = ?",
    )
    .get(id);
}

export function getBookByWorkKey(olWorkKey) {
  return db
    .prepare(
      "SELECT b.*, s.name as shelf_name, s.slug as shelf_slug FROM book b JOIN shelf s ON b.shelf_id = s.id WHERE b.ol_work_key = ?",
    )
    .get(olWorkKey);
}

export function addBook(bookData) {
  const result = db
    .prepare(
      `INSERT INTO book (ol_work_key, ol_edition_key, title, subtitle, author_name, ol_author_key, cover_id, description, number_of_pages, publish_date, publisher, isbn_13, isbn_10, subjects, language, shelf_id, total_pages, reader) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      bookData.ol_work_key || null,
      bookData.ol_edition_key || null,
      bookData.title,
      bookData.subtitle || null,
      bookData.author_name || null,
      bookData.ol_author_key || null,
      bookData.cover_id || null,
      bookData.description || null,
      bookData.number_of_pages || null,
      bookData.publish_date || null,
      bookData.publisher || null,
      bookData.isbn_13 || null,
      bookData.isbn_10 || null,
      bookData.subjects ? JSON.stringify(bookData.subjects) : null,
      bookData.language || null,
      bookData.shelf_id,
      bookData.number_of_pages || null,
      bookData.reader || "me",
    );
  db.prepare("INSERT INTO book_shelf_history (book_id, from_shelf_id, to_shelf_id) VALUES (?, NULL, ?)").run(
    result.lastInsertRowid,
    bookData.shelf_id,
  );
  const shelf = db.prepare("SELECT slug FROM shelf WHERE id = ?").get(bookData.shelf_id);
  if (shelf?.slug === "currently-reading")
    db.prepare("UPDATE book SET date_started = datetime('now') WHERE id = ?").run(result.lastInsertRowid);
  return getBook(result.lastInsertRowid);
}

export function updateBook(id, updates) {
  const fields = ["title", "subtitle", "description", "total_pages"];
  const sets = [];
  const params = [];
  for (const f of fields) {
    if (updates[f] !== undefined) {
      sets.push(`${f} = ?`);
      params.push(updates[f]);
    }
  }
  if (sets.length === 0) return getBook(id);
  sets.push("updated_at = datetime('now')");
  params.push(id);
  db.prepare(`UPDATE book SET ${sets.join(", ")} WHERE id = ?`).run(...params);
  return getBook(id);
}

export function deleteBook(id) {
  db.prepare("DELETE FROM book WHERE id = ?").run(id);
}

export function moveShelf(bookId, newShelfId) {
  const book = db.prepare("SELECT shelf_id FROM book WHERE id = ?").get(bookId);
  if (!book) return null;
  if (book.shelf_id === newShelfId) return getBook(bookId);
  const newShelf = db.prepare("SELECT slug FROM shelf WHERE id = ?").get(newShelfId);
  const updates = ["shelf_id = ?", "updated_at = datetime('now')"];
  const params = [newShelfId];
  if (newShelf.slug === "currently-reading") updates.push("date_started = COALESCE(date_started, datetime('now'))");
  else if (newShelf.slug === "finished") updates.push("date_finished = datetime('now')");
  params.push(bookId);
  db.prepare(`UPDATE book SET ${updates.join(", ")} WHERE id = ?`).run(...params);
  db.prepare("INSERT INTO book_shelf_history (book_id, from_shelf_id, to_shelf_id) VALUES (?, ?, ?)").run(
    bookId,
    book.shelf_id,
    newShelfId,
  );
  return getBook(bookId);
}

export function updateProgress(bookId, currentPage) {
  const book = db.prepare("SELECT total_pages FROM book WHERE id = ?").get(bookId);
  if (!book) return null;
  const pct = book.total_pages ? Math.round((currentPage / book.total_pages) * 1000) / 10 : null;
  db.prepare("UPDATE book SET current_page = ?, updated_at = datetime('now') WHERE id = ?").run(currentPage, bookId);
  db.prepare("INSERT INTO reading_progress (book_id, page, percentage) VALUES (?, ?, ?)").run(bookId, currentPage, pct);
  return getBook(bookId);
}

export function updateRating(bookId, rating) {
  db.prepare("UPDATE book SET rating = ?, updated_at = datetime('now') WHERE id = ?").run(rating, bookId);
  return getBook(bookId);
}

export function updateReview(bookId, review) {
  db.prepare("UPDATE book SET review = ?, updated_at = datetime('now') WHERE id = ?").run(review, bookId);
  return getBook(bookId);
}

export function updateReader(bookId, reader) {
  db.prepare("UPDATE book SET reader = ?, updated_at = datetime('now') WHERE id = ?").run(reader, bookId);
  return getBook(bookId);
}

export function updateLocation(bookId, locationName, locationLat, locationLng) {
  db.prepare(
    "UPDATE book SET location_name = ?, location_lat = ?, location_lng = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(locationName, locationLat, locationLng, bookId);
  return getBook(bookId);
}

export function removeLocation(bookId) {
  db.prepare(
    "UPDATE book SET location_name = NULL, location_lat = NULL, location_lng = NULL, updated_at = datetime('now') WHERE id = ?",
  ).run(bookId);
  return getBook(bookId);
}

export function getProgressHistory(bookId) {
  return db.prepare("SELECT * FROM reading_progress WHERE book_id = ? ORDER BY recorded_at ASC").all(bookId);
}

export function getLibraryWorkKeys() {
  return db
    .prepare("SELECT ol_work_key FROM book WHERE ol_work_key IS NOT NULL")
    .all()
    .map((r) => r.ol_work_key);
}
