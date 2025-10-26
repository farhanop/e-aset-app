// frontend/src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RolesPage } from "./pages/RolesPage";
import { MasterDataPage } from "./pages/MasterDataPage";
import { AssetsPage } from "./pages/AssetsPage";
import { AuthNavigationHandler } from "./components/AuthNavigationHandler";
import { ReportByLocationPage } from "./pages/ReportByLocationPage";
import { AssetDetailPage } from "./components/asset/AssetDetailPage";
import { AssetCreatePage } from "./components/asset/AssetCreatePage";
import { AssetEditPage } from "./components/asset/AssetEditPage";
import { QRCodeGenerator } from "./components/qr/QRCodeGenerator";
import QRCodeListPage from "./components/qr/QRCodeListPage";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

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

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

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
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="master-data" element={<MasterDataPage />} />
          <Route path="transactions" element={<div>Transactions Page</div>} />
          <Route path="reports" element={<div>Reports Page</div>} />
          <Route
            path="reports/laporan-berdasarkan-lokasi"
            element={<ReportByLocationPage />}
          />
          <Route path="settings" element={<div>Settings Page</div>} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/assets-baru" element={<AssetCreatePage />} />
          <Route path="assets/:id" element={<AssetDetailPage />} />
          <Route path="assets/:id/edit" element={<AssetEditPage />} />
          <Route path="qrcodes" element={<QRCodeListPage />} />
          <Route path="qr-generator" element={<QRCodeGenerator value="" />} />
        </Route>

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthNavigationHandler />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
