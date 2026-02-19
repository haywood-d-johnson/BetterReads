import { useState } from "react";
export default function StarRating({ rating = 0, readonly = false, size = "md", onChange }) {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 14, md: 20, lg: 28 };
  const fs = sizes[size] || 20;
  const display = hover || rating;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 2, cursor: readonly ? "default" : "pointer" }}>
      {[1, 2, 3, 4, 5].map((v) => (
        <span
          key={v}
          onClick={() => !readonly && onChange && onChange(v === rating ? 0 : v)}
          onMouseEnter={() => !readonly && setHover(v)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            fontSize: fs,
            color: display >= v ? "var(--color-star)" : "var(--color-star-empty)",
            lineHeight: 1,
            transition: "color 0.15s",
          }}
        >
          &#9733;
        </span>
      ))}
      {rating > 0 && size !== "sm" && (
        <span style={{ marginLeft: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          {rating}
        </span>
      )}
    </div>
  );
}
