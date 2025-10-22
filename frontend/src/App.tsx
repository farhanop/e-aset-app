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
import { AssetsPage } from './pages/AssetsPage';
import { AuthNavigationHandler } from "./components/AuthNavigationHandler";
import { ReportByLocationPage } from "./pages/ReportByLocationPage";
import { AssetDetailPage } from './components/AssetDetailPage';
import { AssetCreatePage } from './components/AssetCreatePage';
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
          <p className="text-gray-600 dark:bg-gray-300">Memuat...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

// Public Route Component
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  const location = useLocation();
  const newLocal = "qr-generator";
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
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="master-data" element={<MasterDataPage />} />
          <Route path="transactions" element={<div>Transactions Page</div>} />
          <Route path="reports" element={<div>Reports Page</div>} />
          <Route path="reports/by-location" element={<ReportByLocationPage />} />
          <Route path="settings" element={<div>Settings Page</div>} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/new" element={<AssetCreatePage />} />
          <Route path="assets/:id" element={<AssetDetailPage />} />
          <Route path="qrcodes" element={<QRCodeListPage />} />
          <Route path={newLocal} element={<QRCodeGenerator value={""} />} />
        </Route>

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
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