// frontend/src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MasterDataPage } from "./pages/MasterDataPage";
import { AssetsPage } from "./pages/AssetsPage";
import { AuthNavigationHandler } from "./components/AuthNavigationHandler";
import { ReportByLocationPage } from "./pages/ReportByLocationPage";
import { AssetDetailPage } from "./components/asset/AssetDetailPage";
import { AssetCreatePage } from "./components/asset/AssetCreatePage";
import { AssetEditPage } from "./components/asset/AssetEditPage";
import { QRCodeGenerator } from "./components/qr/QRCodeGenerator";
import QRCodeListPage from "./components/qr/QRCodeListPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AssetLifecycleManager } from "./pages/AssetLifecycleManager";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Public Route Component
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ThemeProvider>
                <MainLayout />
              </ThemeProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Routes accessible by all roles */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Routes accessible by admin and super-admin */}
          <Route
            path="master-data"
            element={
              <ProtectedRoute allowedRoles={["super-admin", "admin"]}>
                <MasterDataPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="assets"
            element={
              <ProtectedRoute allowedRoles={["super-admin", "admin", "staff"]}>
                <AssetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="assets/assets-baru"
            element={
              <ProtectedRoute allowedRoles={["super-admin", "admin"]}>
                <AssetCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="assets/:id"
            element={
              <ProtectedRoute allowedRoles={["super-admin", "admin", "staff"]}>
                <AssetDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="assets/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["super-admin", "admin"]}>
                <AssetEditPage />
              </ProtectedRoute>
            }
          />

          {/* Peminjaman Routes */}
          <Route
            path="peminjaman"
            element={
              <ProtectedRoute allowedRoles={["super-admin", "admin", "staff"]}>
                <AssetLifecycleManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="reports/laporan-berdasarkan-lokasi"
            element={
              <ProtectedRoute allowedRoles={["super-admin", "admin"]}>
                <ReportByLocationPage />
              </ProtectedRoute>
            }
          />

          {/* Routes accessible only by super-admin */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["super-admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["super-admin"]}>
                <div>Settings Page</div>
              </ProtectedRoute>
            }
          />

          <Route
            path="qrcodes"
            element={
              <ProtectedRoute allowedRoles={["super-admin", "admin"]}>
                <QRCodeListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="qr-generator"
            element={
              <ProtectedRoute allowedRoles={["super-admin", "admin"]}>
                <QRCodeGenerator value="" />
              </ProtectedRoute>
            }
          />

          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={["super-admin", "admin"]}>
                <div>Reports Page</div>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 and Unauthorized Routes */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center p-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                  403 - Unauthorized
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Kembali
                </button>
              </div>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AuthNavigationHandler />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
