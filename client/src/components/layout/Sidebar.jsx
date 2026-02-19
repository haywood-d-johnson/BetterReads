import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getShelves } from "../../api/shelves.js";
export default function Sidebar() {
  const [shelves, setShelves] = useState([]);
  const { shelfSlug } = useParams();
  useEffect(() => {
    getShelves().then(setShelves).catch(console.error);
  }, []);
  useEffect(() => {
    window.__refreshShelves = () => getShelves().then(setShelves).catch(console.error);
    return () => {
      delete window.__refreshShelves;
    };
  }, []);
  const total = shelves.reduce((s, sh) => s + (sh.book_count || 0), 0);
  const linkStyle = (active) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    color: "var(--color-text)",
    textDecoration: "none",
    fontSize: "var(--font-size-sm)",
    background: active ? "var(--color-sidebar-active)" : "transparent",
    fontWeight: active ? 600 : 400,
  });
  return (
    <aside
      className="nav-floral-bg"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--color-bg-card)",
        borderRight: "1px solid var(--color-border-light)",
        padding: "24px 0",
        minHeight: "calc(100vh - var(--header-height))",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "0 16px" }}>
        <h3
          style={{
            fontSize: "var(--font-size-xs)",
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "var(--color-text-muted)",
            marginBottom: 8,
            padding: "0 8px",
          }}
        >
          Shelves
        </h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Link to="/library" style={linkStyle(!shelfSlug)}>
            <span>All Books</span>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                background: "var(--color-bg)",
                padding: "1px 6px",
                borderRadius: 9999,
              }}
            >
              {total}
            </span>
          </Link>
          {shelves.map((s) => (
            <Link key={s.id} to={`/library/${s.slug}`} style={linkStyle(shelfSlug === s.slug)}>
              <span>{s.name}</span>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  background: "var(--color-bg)",
                  padding: "1px 6px",
                  borderRadius: 9999,
                }}
              >
                {s.book_count || 0}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
