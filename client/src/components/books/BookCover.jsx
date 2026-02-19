import { useState } from "react";
export default function BookCover({ coverId, title, size = "M", className = "", style = {} }) {
  const [error, setError] = useState(false);
  if (!coverId || error)
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-cover-gradient)",
          borderRadius: 4,
          boxShadow: "var(--shadow-sm)",
          padding: 8,
          textAlign: "center",
          width: "100%",
          height: "100%",
          ...style,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
            lineHeight: 1.3,
            overflow: "hidden",
          }}
        >
          {title || "No Cover"}
        </span>
      </div>
    );
  return (
    <img
      src={`https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg?default=false`}
      alt={`Cover of ${title}`}
      className={className}
      style={{
        borderRadius: 4,
        boxShadow: "var(--shadow-sm)",
        objectFit: "cover",
        width: "100%",
        height: "100%",
        ...style,
      }}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
