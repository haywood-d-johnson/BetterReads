export default function ReviewDisplay({ review }) {
  if (!review) return null;
  return (
    <div
      style={{
        padding: 16,
        background: "var(--color-bg)",
        borderRadius: 8,
        fontFamily: "var(--font-family)",
        fontStyle: "italic",
        fontSize: "1.25rem",
        color: "var(--color-text-light)",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
      }}
    >
      {review}
    </div>
  );
}
