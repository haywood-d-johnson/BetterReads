export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "24px 0" }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Prev
      </button>
      {start > 1 && (
        <>
          <button className="btn btn-outline btn-sm" onClick={() => onPageChange(1)}>
            1
          </button>
          {start > 2 && <span style={{ padding: "0 4px", color: "var(--color-text-muted)" }}>...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          className={`btn btn-sm ${p === currentPage ? "btn-primary" : "btn-outline"}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ padding: "0 4px", color: "var(--color-text-muted)" }}>...</span>}
          <button className="btn btn-outline btn-sm" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}
      <button
        className="btn btn-outline btn-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
