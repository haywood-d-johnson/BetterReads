import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "../api/books.js";
import { getOverview } from "../api/stats.js";
import BookGrid from "../components/books/BookGrid.jsx";
import ReadingProgressBar from "../components/books/ReadingProgressBar.jsx";
import StatCard from "../components/stats/StatCard.jsx";
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import EmptyState from "../components/shared/EmptyState.jsx";
import ReaderToggle from "../components/shared/ReaderToggle.jsx";

export default function DashboardPage() {
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [reader, setReader] = useState("");
  const [loading, setLoading] = useState(true);

  function fetchDashboard(r) {
    const readerParam = r || undefined;
    return Promise.all([
      getBooks({ shelf: "currently-reading", limit: 10, reader: readerParam }),
      getBooks({ sort: "date_added", order: "desc", limit: 5, reader: readerParam }),
      getOverview(readerParam),
    ]);
  }

  useEffect(() => {
    fetchDashboard(reader)
      .then(([cr, recent, s]) => {
        setCurrentlyReading(cr.books);
        setRecentBooks(recent.books);
        setStats(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDashboard(reader)
      .then(([cr, recent, s]) => {
        setCurrentlyReading(cr.books);
        setRecentBooks(recent.books);
        setStats(s);
      })
      .catch(console.error);
  }, [reader]);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1>Dashboard</h1>
        <ReaderToggle value={reader} onChange={setReader} showAll />
      </div>
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatCard label="Books Read" value={stats.totalFinished} icon={"\u{1F4D6}"} />
          <StatCard label="Pages Read" value={stats.totalPages.toLocaleString()} icon={"\u{1F4C4}"} />
          <StatCard label="Avg Rating" value={stats.avgRating || "\u2014"} icon={"\u2B50"} />
          <StatCard label="This Year" value={stats.finishedThisYear} icon={"\u{1F4C5}"} />
        </div>
      )}

      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2>Currently Reading</h2>
          <Link to="/library/currently-reading" className="btn btn-outline btn-sm">
            View All
          </Link>
        </div>
        {currentlyReading.length === 0 ? (
          <EmptyState
            icon={"\u{1F4D6}"}
            title="Nothing being read"
            message="Search for books and add them to your Currently Reading shelf."
            action={
              <Link to="/search" className="btn btn-primary">
                Search Books
              </Link>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {currentlyReading.map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  textDecoration: "none",
                  color: "var(--color-text)",
                  padding: 16,
                }}
              >
                <div>
                  <h4>{book.title}</h4>
                  {book.author_name && (
                    <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                      {book.author_name}
                    </p>
                  )}
                </div>
                <ReadingProgressBar currentPage={book.current_page} totalPages={book.total_pages} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2>Recently Added</h2>
          <Link to="/library" className="btn btn-outline btn-sm">
            View Library
          </Link>
        </div>
        {recentBooks.length === 0 ? (
          <EmptyState
            icon={"\u{1F50D}"}
            title="No books yet"
            message="Start by searching for your favorite books."
            action={
              <Link to="/search" className="btn btn-primary">
                Search Books
              </Link>
            }
          />
        ) : (
          <BookGrid books={recentBooks} />
        )}
      </section>
    </div>
  );
}
