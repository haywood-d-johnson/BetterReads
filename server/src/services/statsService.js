import db from "../db/connection.js";

function readerClause(reader, prefix = "") {
  if (reader === "me" || reader === "kids") {
    return { sql: ` AND ${prefix}reader = ?`, params: [reader] };
  }
  return { sql: "", params: [] };
}

export function getOverview(reader) {
  const r = readerClause(reader);
  const totalBooks = db.prepare(`SELECT COUNT(*) as count FROM book WHERE 1=1${r.sql}`).get(...r.params).count;
  const totalFinished = db
    .prepare(`SELECT COUNT(*) as count FROM book WHERE date_finished IS NOT NULL${r.sql}`)
    .get(...r.params).count;
  const totalPages = db
    .prepare(`SELECT COALESCE(SUM(number_of_pages), 0) as total FROM book WHERE date_finished IS NOT NULL${r.sql}`)
    .get(...r.params).total;
  const avgRating = db
    .prepare(`SELECT ROUND(AVG(rating), 2) as avg FROM book WHERE rating IS NOT NULL${r.sql}`)
    .get(...r.params).avg;
  const finishedThisYear = db
    .prepare(
      `SELECT COUNT(*) as count FROM book WHERE strftime('%Y', date_finished) = strftime('%Y', 'now')${r.sql}`,
    )
    .get(...r.params).count;
  const rc = readerClause(reader, "b.");
  const currentlyReading = db
    .prepare(
      `SELECT COUNT(*) as count FROM book b JOIN shelf s ON b.shelf_id = s.id WHERE s.slug = 'currently-reading'${rc.sql}`,
    )
    .get(...rc.params).count;
  return { totalBooks, totalFinished, totalPages, avgRating: avgRating || 0, finishedThisYear, currentlyReading };
}

export function getByYear(year, reader) {
  const r = readerClause(reader);
  const rows = db
    .prepare(
      `SELECT strftime('%m', date_finished) as month, COUNT(*) as count FROM book WHERE date_finished IS NOT NULL AND strftime('%Y', date_finished) = ?${r.sql} GROUP BY month ORDER BY month`,
    )
    .all(String(year), ...r.params);
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const ms = String(m).padStart(2, "0");
    const found = rows.find((row) => row.month === ms);
    months.push({ month: m, count: found ? found.count : 0 });
  }
  return months;
}

export function getGenres(reader) {
  const r = readerClause(reader);
  return db
    .prepare(
      `SELECT je.value as subject, COUNT(*) as count FROM book, json_each(book.subjects) as je WHERE book.date_finished IS NOT NULL AND book.subjects IS NOT NULL${r.sql} GROUP BY je.value ORDER BY count DESC LIMIT 15`,
    )
    .all(...r.params);
}

export function getRatings(reader) {
  const r = readerClause(reader);
  const rows = db
    .prepare(
      `SELECT CAST(rating AS INTEGER) as rating_bucket, COUNT(*) as count FROM book WHERE rating IS NOT NULL${r.sql} GROUP BY rating_bucket ORDER BY rating_bucket`,
    )
    .all(...r.params);
  const ratings = [];
  for (let i = 1; i <= 5; i++) {
    const found = rows.find((row) => row.rating_bucket === i);
    ratings.push({ rating: i, count: found ? found.count : 0 });
  }
  return ratings;
}
