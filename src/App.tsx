import React from "react";
import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./pages/LoginPage";
import { PartiesListPage } from "./pages/PartiesListPage";
import { PartyDashboardPage } from "./pages/PartyDashboardPage";
import { PublicPartyPage } from "./pages/PublicPartyPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Carregando...
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          loading ? null : isAuthenticated ? (
            <Navigate to="/parties" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route path="/festa/:shareToken" element={<PublicPartyPage />} />
      <Route
        path="/parties"
        element={
          <ProtectedRoute>
            <PartiesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parties/:partyId"
        element={
          <ProtectedRoute>
            <PartyDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/parties" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
