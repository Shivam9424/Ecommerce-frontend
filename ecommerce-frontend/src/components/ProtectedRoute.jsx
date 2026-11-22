import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, role } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (adminOnly && role !== "ADMIN") return <Navigate to="/" replace />;

  return children;
}