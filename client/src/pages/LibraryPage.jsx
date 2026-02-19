import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getBooks } from "../api/books.js";
import { getShelves } from "../api/shelves.js";
import BookGrid from "../components/books/BookGrid.jsx";
import BookListItem from "../components/books/BookListItem.jsx";
import Pagination from "../components/shared/Pagination.jsx";
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";
import ReaderToggle from "../components/shared/ReaderToggle.jsx";

export default function LibraryPage() {
  const { shelfSlug: shelf } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shelfName, setShelfName] = useState("All Books");
  const [view, setView] = useState(searchParams.get("view") || "grid");
  const [reader, setReader] = useState("");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const sort = searchParams.get("sort") || "date_added";
  const order = searchParams.get("order") || "desc";
  const limit = 24;

  useEffect(() => {
    setLoading(true);
    const params = { sort, order, page, limit };
    if (shelf) params.shelf = shelf;
    if (reader) params.reader = reader;

    Promise.all([getBooks(params), shelf ? getShelves() : Promise.resolve([])])
      .then(([data, shelves]) => {
        setBooks(data.books || []);
        setTotal(data.total || 0);
        if (shelf && shelves.length) {
          const found = shelves.find((s) => s.slug === shelf);
          setShelfName(found ? found.name : "Library");
        } else {
          setShelfName("All Books");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shelf, sort, order, page, reader]);

  function updateParams(updates) {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === undefined) next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next);
  }

  function handleSortChange(e) {
    updateParams({ sort: e.target.value, page: null });
  }

  function toggleView() {
    const next = view === "grid" ? "list" : "grid";
    setView(next);
    updateParams({ view: next });
  }

  function handlePageChange(p) {
    updateParams({ page: p > 1 ? p : null });
    window.scrollTo(0, 0);
  }

  const totalPages = Math.ceil(total / limit);

  if (loading) return <LoadingSpinner text="Loading library..." />;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1>
          {shelfName}{" "}
          {total > 0 && (
            <span style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-muted)", fontWeight: "normal" }}>
              ({total})
            </span>
          )}
        </h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ReaderToggle value={reader} onChange={setReader} showAll />
          <select
            className="form-input"
            style={{ width: "auto", padding: "4px 8px" }}
            value={sort}
            onChange={handleSortChange}
          >
            <option value="date_added">Date Added</option>
            <option value="title">Title</option>
            <option value="author_name">Author</option>
            <option value="rating">Rating</option>
          </select>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => updateParams({ order: order === "desc" ? "asc" : "desc" })}
            title="Toggle sort order"
          >
            {order === "desc" ? "\u2193" : "\u2191"}
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={toggleView}
            title={`Switch to ${view === "grid" ? "list" : "grid"} view`}
          >
            {view === "grid" ? "\u2630" : "\u25A6"}
          </button>
        </div>
      </div>

      {books.length === 0 ? (
        <EmptyState
          icon={"\u{1F4DA}"}
          title="No books here yet"
          message={
            shelf
              ? "Move books to this shelf or search for new ones."
              : "Search for books and add them to your library."
          }
        />
      ) : view === "grid" ? (
        <BookGrid books={books} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {books.map((book) => (
            <BookListItem key={book.id} book={book} />
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
