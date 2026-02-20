import db from "../db/connection.js";

export async function getBooks({ shelfSlug, reader, sort = "date_added", order = "desc", page = 1, limit = 20 }) {
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
  const countResult = await db.execute({ sql: countQuery, args: params });
  const total = countResult.rows[0].total;
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
  const allParams = [...params, limit, offset];
  const booksResult = await db.execute({ sql: query, args: allParams });
  return { books: booksResult.rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getBook(id) {
  const result = await db.execute({
    sql: "SELECT b.*, s.name as shelf_name, s.slug as shelf_slug FROM book b JOIN shelf s ON b.shelf_id = s.id WHERE b.id = ?",
    args: [id],
  });
  return result.rows[0] || null;
}

export async function getBookByWorkKey(olWorkKey) {
  const result = await db.execute({
    sql: "SELECT b.*, s.name as shelf_name, s.slug as shelf_slug FROM book b JOIN shelf s ON b.shelf_id = s.id WHERE b.ol_work_key = ?",
    args: [olWorkKey],
  });
  return result.rows[0] || null;
}

export async function addBook(bookData) {
  const result = await db.execute({
    sql: `INSERT INTO book (ol_work_key, ol_edition_key, title, subtitle, author_name, ol_author_key, cover_id, description, number_of_pages, publish_date, publisher, isbn_13, isbn_10, subjects, language, shelf_id, total_pages, reader) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
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
    ],
  });
  const newId = Number(result.lastInsertRowid);
  await db.execute({
    sql: "INSERT INTO book_shelf_history (book_id, from_shelf_id, to_shelf_id) VALUES (?, NULL, ?)",
    args: [newId, bookData.shelf_id],
  });
  const shelf = await db.execute({
    sql: "SELECT slug FROM shelf WHERE id = ?",
    args: [bookData.shelf_id],
  });
  if (shelf.rows[0]?.slug === "currently-reading") {
    await db.execute({
      sql: "UPDATE book SET date_started = datetime('now') WHERE id = ?",
      args: [newId],
    });
  }
  return getBook(newId);
}

export async function updateBook(id, updates) {
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
  await db.execute({
    sql: `UPDATE book SET ${sets.join(", ")} WHERE id = ?`,
    args: params,
  });
  return getBook(id);
}

export async function deleteBook(id) {
  await db.execute({ sql: "DELETE FROM book WHERE id = ?", args: [id] });
}

export async function moveShelf(bookId, newShelfId) {
  const bookResult = await db.execute({
    sql: "SELECT shelf_id FROM book WHERE id = ?",
    args: [bookId],
  });
  const book = bookResult.rows[0];
  if (!book) return null;
  if (book.shelf_id === newShelfId) return getBook(bookId);
  const shelfResult = await db.execute({
    sql: "SELECT slug FROM shelf WHERE id = ?",
    args: [newShelfId],
  });
  const newShelf = shelfResult.rows[0];
  const updates = ["shelf_id = ?", "updated_at = datetime('now')"];
  const params = [newShelfId];
  if (newShelf.slug === "currently-reading") updates.push("date_started = COALESCE(date_started, datetime('now'))");
  else if (newShelf.slug === "finished") updates.push("date_finished = datetime('now')");
  params.push(bookId);
  await db.execute({
    sql: `UPDATE book SET ${updates.join(", ")} WHERE id = ?`,
    args: params,
  });
  await db.execute({
    sql: "INSERT INTO book_shelf_history (book_id, from_shelf_id, to_shelf_id) VALUES (?, ?, ?)",
    args: [bookId, book.shelf_id, newShelfId],
  });
  return getBook(bookId);
}

export async function updateProgress(bookId, currentPage) {
  const bookResult = await db.execute({
    sql: "SELECT total_pages FROM book WHERE id = ?",
    args: [bookId],
  });
  const book = bookResult.rows[0];
  if (!book) return null;
  const pct = book.total_pages ? Math.round((currentPage / book.total_pages) * 1000) / 10 : null;
  await db.execute({
    sql: "UPDATE book SET current_page = ?, updated_at = datetime('now') WHERE id = ?",
    args: [currentPage, bookId],
  });
  await db.execute({
    sql: "INSERT INTO reading_progress (book_id, page, percentage) VALUES (?, ?, ?)",
    args: [bookId, currentPage, pct],
  });
  return getBook(bookId);
}

export async function updateRating(bookId, rating) {
  await db.execute({
    sql: "UPDATE book SET rating = ?, updated_at = datetime('now') WHERE id = ?",
    args: [rating, bookId],
  });
  return getBook(bookId);
}

export async function updateReview(bookId, review) {
  await db.execute({
    sql: "UPDATE book SET review = ?, updated_at = datetime('now') WHERE id = ?",
    args: [review, bookId],
  });
  return getBook(bookId);
}

export async function updateReader(bookId, reader) {
  await db.execute({
    sql: "UPDATE book SET reader = ?, updated_at = datetime('now') WHERE id = ?",
    args: [reader, bookId],
  });
  return getBook(bookId);
}

export async function updateLocation(bookId, locationName, locationLat, locationLng) {
  await db.execute({
    sql: "UPDATE book SET location_name = ?, location_lat = ?, location_lng = ?, updated_at = datetime('now') WHERE id = ?",
    args: [locationName, locationLat, locationLng, bookId],
  });
  return getBook(bookId);
}

export async function removeLocation(bookId) {
  await db.execute({
    sql: "UPDATE book SET location_name = NULL, location_lat = NULL, location_lng = NULL, updated_at = datetime('now') WHERE id = ?",
    args: [bookId],
  });
  return getBook(bookId);
}

export async function getProgressHistory(bookId) {
  const result = await db.execute({
    sql: "SELECT * FROM reading_progress WHERE book_id = ? ORDER BY recorded_at ASC",
    args: [bookId],
  });
  return result.rows;
}

export async function getLibraryWorkKeys() {
  const result = await db.execute("SELECT ol_work_key FROM book WHERE ol_work_key IS NOT NULL");
  return result.rows.map((r) => r.ol_work_key);
}
