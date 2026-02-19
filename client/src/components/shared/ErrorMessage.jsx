export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "var(--color-danger)" }}>
      <p style={{ marginBottom: 16 }}>{message || "Something went wrong"}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
