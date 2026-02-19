export default function ReadingProgressBar({ currentPage, totalPages }) {
  if (!totalPages) return null;
  const pct = Math.min(Math.round((currentPage / totalPages) * 100), 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ height: 8, background: "var(--color-progress-bg)", borderRadius: 9999, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, var(--color-progress), var(--color-progress-end))",
            borderRadius: 9999,
            width: `${pct}%`,
            transition: "width 0.25s",
          }}
        />
      </div>
      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
        {currentPage} / {totalPages} pages ({pct}%)
      </span>
    </div>
  );
}
