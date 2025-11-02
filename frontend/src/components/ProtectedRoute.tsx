import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = "/unauthorized",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // PERBAIKAN: Type-safe role checking
  if (allowedRoles && allowedRoles.length > 0) {
    // Pastikan user.role ada dan bertipe string
    if (!user?.role || typeof user.role !== "string") {
      return <Navigate to={fallbackPath} replace />;
    }

    // Sekarang TypeScript tahu user.role adalah string
    const hasAllowedRole = allowedRoles.includes(user.role);

    if (!hasAllowedRole) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
}
