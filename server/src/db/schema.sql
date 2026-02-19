CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shelf (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- EX: "Want to Read"
    slug TEXT NOT NULL UNIQUE, -- ex: "want-to-read" (Url-friendly)
    is_default INTEGER NOT NULL DEFAULT 0, -- For user created tables all defaults cannot be deleted
    sort_order INTEGER NOT NULL DEFAULT 0, -- display order
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Seeded with: Want to Read (0), Currently Reading (1), Finished (2), Did Not Finish (3)

CREATE TABLE IF NOT EXISTS book (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Open Library identifiers
    ol_work_key     TEXT,                 -- "/works/OL893415W"
    ol_edition_key  TEXT,                 -- "/books/OL7827810M"
    -- Cached metadata from Open Library
    title           TEXT NOT NULL,
    subtitle        TEXT,
    author_name     TEXT,                 -- display name: "Frank Herbert"
    ol_author_key   TEXT,                 -- "/authors/OL79034A" (for linking to author page)
    cover_id        INTEGER,             -- OL cover ID → build cover URL
    description     TEXT,                -- from Works API
    number_of_pages INTEGER,             -- from edition or search
    publish_date    TEXT,
    publisher       TEXT,
    isbn_13         TEXT,
    isbn_10         TEXT,
    subjects        TEXT,                -- JSON array stored as TEXT: '["Science Fiction","Space"]'
    language        TEXT,                -- "eng"
    -- Your personal data
    shelf_id        INTEGER NOT NULL,    -- which shelf it's on
    rating          REAL,                -- 0.5 to 5.0 (half-star increments)
    review          TEXT,                -- your personal notes
    current_page    INTEGER DEFAULT 0,   -- reading progress
    total_pages     INTEGER,             -- can override OL page count
    date_added      TEXT NOT NULL DEFAULT (datetime('now')),
    date_started    TEXT,                -- set when moved to "Currently Reading"
    date_finished   TEXT,                -- set when moved to "Finished"
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    -- Location: where the book "takes place" (user-assigned)
    location_name   TEXT,                -- "Chicago, IL, USA"
    location_lat    REAL,                -- latitude
    location_lng    REAL,                -- longitude
    -- Reader: who reads this book ("me" or "kids")
    reader          TEXT DEFAULT 'me',   -- "me" = wife reads it, "kids" = read to the kids
    FOREIGN KEY (shelf_id) REFERENCES shelf(id)
);

CREATE TABLE IF NOT EXISTS book_shelf_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    from_shelf_id INTEGER, -- initially null
    to_shelf_id INTEGER NOT NULL,
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE
);
-- Every time you move a book between shelves, a row is logged here. Powers the reading timeline ("Added Jan 5 → Started Jan 10 → Finished Feb 3").

CREATE TABLE IF NOT EXISTS reading_progress (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id     INTEGER NOT NULL,
    page        INTEGER NOT NULL,
    percentage  REAL,                    -- computed: page / total_pages * 100
    recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ol_cache (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key     TEXT NOT NULL UNIQUE,   -- "search:dune:1:20" or "work:OL893415W"
    response_json TEXT NOT NULL,          -- full JSON response body
    cached_at     TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at    TEXT NOT NULL           -- cached_at + TTL
);
-- Caches raw API responses to stay under rate limits and make the app feel fast. TTLs: search = 1 hour, works/editions/authors = 7 days. Expired rows are cleaned up periodically.