import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getOLWork } from "../api/books.js";
import { getShelves } from "../api/shelves.js";
import BookCover from "../components/books/BookCover.jsx";
import AddToLibraryButton from "../components/books/AddToLibraryButton.jsx";
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import ErrorMessage from "../components/shared/ErrorMessage.jsx";

export default function OLBookDetailPage() {
  const { olWorkKey } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWork = useCallback(async () => {
    try {
      const [w, s] = await Promise.all([getOLWork(olWorkKey), getShelves()]);
      setWork(w);
      setShelves(s);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load book details");
    } finally {
      setLoading(false);
    }
  }, [olWorkKey]);

  useEffect(() => {
    fetchWork();
  }, [fetchWork]);

  function handleAdded() {
    // After adding to library, redirect to the local book detail page
    fetchWork().then(() => {
      if (work?.local_book?.id) {
        navigate(`/book/${work.local_book.id}`);
      }
    });
    // Re-fetch to get the updated local_book reference
    setTimeout(async () => {
      try {
        const updated = await getOLWork(olWorkKey);
        if (updated.local_book?.id) {
          navigate(`/book/${updated.local_book.id}`);
        }
      } catch {}
    }, 500);
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading book details..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!work) return <ErrorMessage message="Book not found" />;

  // If already in library, redirect to local book detail
  if (work.in_library && work.local_book?.id) {
    navigate(`/book/${work.local_book.id}`, { replace: true });
    return null;
  }

  const bookData = {
    ol_work_key: work.ol_work_key,
    title: work.title,
    author_name: work.author_name,
    ol_author_key: work.ol_author_key,
    cover_id: work.cover_id,
    subjects: work.subjects,
    description: work.description,
    publish_date: work.first_publish_date || null,
  };

  const authorKeyClean = work.ol_author_key?.replace("/authors/", "");

  return (
    <div>
      <Link
        to="/search"
        style={{
          color: "var(--color-accent)",
          textDecoration: "none",
          fontSize: "var(--font-size-sm)",
          display: "inline-block",
          marginBottom: 16,
        }}
      >
        &larr; Back to Search
      </Link>

      <div data-book-detail-layout style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32, alignItems: "start" }}>
        <div>
          <BookCover coverId={work.cover_id} title={work.title} size="L" style={{ width: "100%", borderRadius: 8 }} />
          <div style={{ marginTop: 16 }}>
            <AddToLibraryButton bookData={bookData} shelves={shelves} inLibrary={false} onAdded={handleAdded} />
          </div>
        </div>

        <div>
          <h1 style={{ marginBottom: 4 }}>{work.title}</h1>
          {work.subtitle && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-lg)", marginBottom: 8 }}>
              {work.subtitle}
            </p>
          )}
          {work.author_name && (
            <p style={{ fontSize: "var(--font-size-lg)", marginBottom: 16 }}>
              by{" "}
              {authorKeyClean ? (
                <Link to={`/author/${authorKeyClean}`} style={{ color: "var(--color-accent)", textDecoration: "none" }}>
                  {work.author_name}
                </Link>
              ) : (
                work.author_name
              )}
            </p>
          )}

          {work.first_publish_date && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", marginBottom: 16 }}>
              First published: {work.first_publish_date}
            </p>
          )}

          {work.description && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 8 }}>Description</h3>
              <p style={{ lineHeight: 1.6, color: "var(--color-text-light)" }}>{work.description}</p>
            </div>
          )}

          {work.subjects?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 8 }}>Subjects</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {work.subjects.map((s, i) => (
                  <span key={i} className="badge">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              padding: 20,
              background: "var(--color-bg-card)",
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--color-text-muted)", marginBottom: 12 }}>
              Add this book to your library to track progress, rate, and review it.
            </p>
            <AddToLibraryButton bookData={bookData} shelves={shelves} inLibrary={false} onAdded={handleAdded} />
          </div>
        </div>
      </div>
    </div>
  );
}
