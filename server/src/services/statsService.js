import db from "../db/connection.js";

function readerClause(reader, prefix = "") {
  if (reader === "me" || reader === "kids") {
    return { sql: ` AND ${prefix}reader = ?`, params: [reader] };
  }
  return { sql: "", params: [] };
}

export async function getOverview(reader) {
  const r = readerClause(reader);
  const rc = readerClause(reader, "b.");

  // Batch all 6 queries in one round trip
  const results = await db.batch([
    { sql: `SELECT COUNT(*) as count FROM book WHERE 1=1${r.sql}`, args: r.params },
    { sql: `SELECT COUNT(*) as count FROM book WHERE date_finished IS NOT NULL${r.sql}`, args: r.params },
    {
      sql: `SELECT COALESCE(SUM(number_of_pages), 0) as total FROM book WHERE date_finished IS NOT NULL${r.sql}`,
      args: r.params,
    },
    { sql: `SELECT ROUND(AVG(rating), 2) as avg FROM book WHERE rating IS NOT NULL${r.sql}`, args: r.params },
    {
      sql: `SELECT COUNT(*) as count FROM book WHERE strftime('%Y', date_finished) = strftime('%Y', 'now')${r.sql}`,
      args: r.params,
    },
    {
      sql: `SELECT COUNT(*) as count FROM book b JOIN shelf s ON b.shelf_id = s.id WHERE s.slug = 'currently-reading'${rc.sql}`,
      args: rc.params,
    },
  ]);

  // Fetch current year's goal separately (reader-aware query differs from batch)
  const goalQuery = reader === "me" || reader === "kids"
    ? { sql: "SELECT target_books FROM reading_goal WHERE year = CAST(strftime('%Y', 'now') AS INTEGER) AND reader = ?", args: [reader] }
    : { sql: "SELECT target_books FROM reading_goal WHERE year = CAST(strftime('%Y', 'now') AS INTEGER) AND reader = 'me'", args: [] };
  const goalResult = await db.execute(goalQuery);

  return {
    totalBooks: results[0].rows[0].count,
    totalFinished: results[1].rows[0].count,
    totalPages: results[2].rows[0].total,
    avgRating: results[3].rows[0].avg || 0,
    finishedThisYear: results[4].rows[0].count,
    currentlyReading: results[5].rows[0].count,
    yearlyGoal: goalResult.rows[0]?.target_books || null,
  };
}

export async function getByYear(year, reader) {
  const r = readerClause(reader);
  const result = await db.execute({
    sql: `SELECT strftime('%m', date_finished) as month, COUNT(*) as count FROM book WHERE date_finished IS NOT NULL AND strftime('%Y', date_finished) = ?${r.sql} GROUP BY month ORDER BY month`,
    args: [String(year), ...r.params],
  });
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const ms = String(m).padStart(2, "0");
    const found = result.rows.find((row) => row.month === ms);
    months.push({ month: m, count: found ? found.count : 0 });
  }
  return months;
}

export async function getGenres(reader) {
  const r = readerClause(reader);
  const result = await db.execute({
    sql: `SELECT je.value as subject, COUNT(*) as count FROM book, json_each(book.subjects) as je WHERE book.date_finished IS NOT NULL AND book.subjects IS NOT NULL${r.sql} GROUP BY je.value ORDER BY count DESC LIMIT 15`,
    args: r.params,
  });
  return result.rows;
}

export async function getGoal(year, reader) {
  const r = reader === "me" || reader === "kids" ? reader : "me";
  const result = await db.execute({
    sql: "SELECT year, target_books, reader FROM reading_goal WHERE year = ? AND reader = ?",
    args: [Number(year), r],
  });
  return result.rows[0] || null;
}

export async function setGoal(year, targetBooks, reader) {
  const r = reader === "me" || reader === "kids" ? reader : "me";
  await db.execute({
    sql: `INSERT INTO reading_goal (year, target_books, reader) VALUES (?, ?, ?)
          ON CONFLICT(year, reader) DO UPDATE SET target_books = ?, updated_at = datetime('now')`,
    args: [Number(year), Number(targetBooks), r, Number(targetBooks)],
  });
  return { year: Number(year), target_books: Number(targetBooks), reader: r };
}

export async function getRatings(reader) {
  const r = readerClause(reader);
  const result = await db.execute({
    sql: `SELECT CAST(rating AS INTEGER) as rating_bucket, COUNT(*) as count FROM book WHERE rating IS NOT NULL${r.sql} GROUP BY rating_bucket ORDER BY rating_bucket`,
    args: r.params,
  });
  const ratings = [];
  for (let i = 1; i <= 5; i++) {
    const found = result.rows.find((row) => row.rating_bucket === i);
    ratings.push({ rating: i, count: found ? found.count : 0 });
  }
  return ratings;
}
