import { Link } from "react-router-dom";
import BookCover from "./BookCover.jsx";
import StarRating from "../reviews/StarRating.jsx";
export default function BookListItem({ book }) {
  return (
    <Link
      to={`/book/${book.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 12,
        background: "var(--color-bg-card)",
        borderRadius: 8,
        textDecoration: "none",
        color: "var(--color-text)",
      }}
    >
      <div style={{ width: 40, height: 60, flexShrink: 0 }}>
        <BookCover coverId={book.cover_id} title={book.title} size="S" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {book.title}
        </h4>
        {book.author_name && (
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>by {book.author_name}</p>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {book.rating > 0 && <StarRating rating={book.rating} readonly size="sm" />}
        <span className="badge badge-primary">{book.shelf_name}</span>
      </div>
    </Link>
  );
}
