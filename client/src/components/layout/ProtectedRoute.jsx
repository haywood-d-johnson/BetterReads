import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" text="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
