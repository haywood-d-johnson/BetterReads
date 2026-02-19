export default function EmptyState({ icon = "\u{1F4DA}", title, message, action }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        textAlign: "center",
        color: "var(--color-text-muted)",
      }}
    >
      <span style={{ fontSize: "3rem", marginBottom: 16 }}>{icon}</span>
      {title && <h3 style={{ marginBottom: 8, color: "var(--color-text-light)" }}>{title}</h3>}
      {message && <p style={{ marginBottom: 16 }}>{message}</p>}
      {action}
    </div>
  );
}
