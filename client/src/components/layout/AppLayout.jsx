import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import BottomTabBar from "./BottomTabBar.jsx";
import { useIsMobile } from "../../hooks/useMediaQuery.js";
import { useTheme } from "../../hooks/useTheme.js";

export default function AppLayout() {
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <div style={{ display: "flex", flex: 1 }}>
        {!isMobile && <Sidebar />}
        <main data-main-content style={{ flex: 1, padding: 24, maxWidth: "100%", overflowX: "hidden" }}>
          <Outlet />
        </main>
      </div>
      {isMobile && <BottomTabBar />}
    </div>
  );
}
