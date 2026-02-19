import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import BookDetailPage from "./pages/BookDetailPage.jsx";
import OLBookDetailPage from "./pages/OLBookDetailPage.jsx";
import AuthorPage from "./pages/AuthorPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import ShelfManagementPage from "./pages/ShelfManagementPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:shelfSlug" element={<LibraryPage />} />
          <Route path="/book/ol/:olWorkKey" element={<OLBookDetailPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
          <Route path="/author/:olAuthorKey" element={<AuthorPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/shelves" element={<ShelfManagementPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
