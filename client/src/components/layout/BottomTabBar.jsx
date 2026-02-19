import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", icon: "\uD83C\uDFE0", label: "Home" },
  { to: "/search", icon: "\uD83D\uDD0D", label: "Search" },
  { to: "/library", icon: "\uD83D\uDCDA", label: "Library" },
  { to: "/stats", icon: "\uD83D\uDCCA", label: "Stats" },
  { to: "/shelves", icon: "\uD83D\uDCD6", label: "Shelves" },
];

export default function BottomTabBar() {
  return (
    <nav
      data-bottom-tabs
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        height: 56,
        background: "var(--color-bg-card)",
        borderTop: "1px solid var(--color-border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flex: 1,
            height: "100%",
            textDecoration: "none",
            color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
            fontSize: 20,
            transition: "color 0.15s",
          })}
        >
          <span>{tab.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
