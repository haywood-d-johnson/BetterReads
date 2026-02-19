export default function StatCard({ label, value, icon }) {
  return (
    <div
      data-stat-card
      className="card"
      style={{
        textAlign: "center",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      {icon && <span style={{ fontSize: "2rem" }}>{icon}</span>}
      <div
        style={{
          fontSize: "var(--font-size-2xl)",
          fontWeight: 700,
          fontFamily: "var(--font-family)",
          color: "var(--color-primary-dark)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
    </div>
  );
}
