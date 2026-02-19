import { useNavigate, Link } from "react-router-dom";
import BookCover from "../books/BookCover.jsx";
import AddToLibraryButton from "../books/AddToLibraryButton.jsx";

export default function SearchResultCard({ result, shelves, libraryKeys, onAdded }) {
  const navigate = useNavigate();
  const workKey = result.key;
  const inLibrary = libraryKeys instanceof Set ? libraryKeys.has(workKey) : (libraryKeys || []).includes(workKey);
  const bookData = {
    ol_work_key: workKey,
    title: result.title,
    author_name: result.author_name?.[0] || null,
    ol_author_key: result.author_key?.[0] ? `/authors/${result.author_key[0]}` : null,
    cover_id: result.cover_i || null,
    number_of_pages: result.number_of_pages_median || null,
    publish_date: result.first_publish_year ? String(result.first_publish_year) : null,
    subjects: result.subject?.slice(0, 10) || null,
    isbn_13: result.isbn?.[0] || null,
  };
  const authorKey = result.author_key?.[0];

  // Strip /works/ prefix for the URL
  const olWorkId = workKey.replace("/works/", "");

  function handleCardClick(e) {
    // Don't navigate if clicking on a link or button inside the card
    if (e.target.closest("a") || e.target.closest("button")) return;
    navigate(`/book/ol/${olWorkId}`);
  }

  return (
    <div
      data-search-card
      onClick={handleCardClick}
      style={{
        display: "flex",
        gap: 16,
        padding: 16,
        background: "var(--color-bg-card)",
        borderRadius: 12,
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
    >
      <div style={{ width: 100, height: 150, flexShrink: 0 }}>
        <BookCover coverId={result.cover_i} title={result.title} size="M" />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <h3 style={{ fontSize: "var(--font-size-lg)", lineHeight: 1.3 }}>{result.title}</h3>
        {result.author_name && (
          <p style={{ color: "var(--color-text-light)", fontSize: "var(--font-size-sm)" }}>
            by{" "}
            {authorKey ? (
              <Link to={`/author/${authorKey}`} onClick={(e) => e.stopPropagation()}>
                {result.author_name[0]}
              </Link>
            ) : (
              result.author_name[0]
            )}
          </p>
        )}
        <div style={{ display: "flex", gap: 16, color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
          {result.first_publish_year && <span>First published: {result.first_publish_year}</span>}
          {result.edition_count && <span>{result.edition_count} editions</span>}
          {result.number_of_pages_median && <span>{result.number_of_pages_median} pages</span>}
        </div>
        {result.subject && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
            {result.subject.slice(0, 5).map((s) => (
              <span key={s} className="badge badge-primary">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      {!inLibrary && (
        <div style={{ flexShrink: 0, alignSelf: "flex-start" }}>
          <AddToLibraryButton
            bookData={bookData}
            shelves={shelves}
            inLibrary={false}
            onAdded={() => {
              if (onAdded) onAdded(workKey);
            }}
          />
        </div>
      )}
      {inLibrary && (
        <div style={{ flexShrink: 0, alignSelf: "flex-start" }}>
          <span className="badge badge-success">In Library</span>
        </div>
      )}
    </div>
  );
}
