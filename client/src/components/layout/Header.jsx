import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Header({ theme, onToggleTheme }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header
      data-header
      className="nav-floral-bg"
      style={{
        background: "var(--color-bg-header)",
        color: "var(--color-text-inverse)",
        height: "var(--header-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-family)",
            fontSize: "var(--font-size-xl)",
            fontWeight: 700,
            color: "var(--color-accent)",
            textDecoration: "none",
          }}
        >
          BetterReads
        </Link>
        <nav data-main-nav style={{ display: "flex", gap: 16 }}>
          {[
            ["/", "Dashboard"],
            ["/search", "Search"],
            ["/library", "Library"],
            ["/stats", "Stats"],
          ].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              style={{
                color: "var(--color-text-inverse)",
                opacity: 0.8,
                textDecoration: "none",
                fontSize: "var(--font-size-sm)",
                fontWeight: 500,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Link
          to="/shelves"
          data-main-nav
          className="btn btn-outline btn-sm"
          style={{ color: "var(--color-text-inverse)", borderColor: "var(--color-header-border)" }}
        >
          Shelves
        </Link>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          className="btn btn-outline btn-sm"
          style={{ color: "var(--color-text-inverse)", borderColor: "var(--color-header-border)" }}
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
