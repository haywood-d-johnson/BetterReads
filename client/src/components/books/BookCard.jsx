import { Link } from "react-router-dom";
import BookCover from "./BookCover.jsx";
import StarRating from "../reviews/StarRating.jsx";
export default function BookCard({ book }) {
  return (
    <Link
      to={`/book/${book.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg-card)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
        transition: "all 0.25s",
        textDecoration: "none",
        color: "var(--color-text)",
      }}
    >
      <div style={{ width: "100%", aspectRatio: "2/3", overflow: "hidden" }}>
        <BookCover coverId={book.cover_id} title={book.title} size="M" />
      </div>
      <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <h4
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {book.title}
        </h4>
        {book.author_name && (
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{book.author_name}</p>
        )}
        {book.rating > 0 && <StarRating rating={book.rating} readonly size="sm" />}
      </div>
    </Link>
  );
}
