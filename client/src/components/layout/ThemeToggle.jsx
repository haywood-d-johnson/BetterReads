export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="btn btn-outline btn-sm"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      style={{
        color: "var(--color-text-inverse)",
        borderColor: "var(--color-header-border)",
        fontSize: "1rem",
        lineHeight: 1,
        padding: "4px 8px",
      }}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
