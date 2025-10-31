import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "sonner";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Prevent back navigation after logout and forward navigation on login page
    const handlePopState = (_event: PopStateEvent) => {
      if (!user) {
        // If user is not logged in, prevent going back and redirect to login
        window.history.replaceState(null, "", "/login");
        window.location.href = "/login";
      } else if (
        window.location.pathname === "/login" ||
        window.location.pathname === "/register"
      ) {
        // If user is logged in and on login/register page, prevent forward navigation
        window.history.replaceState(null, "", "/dashboard");
        window.location.href = "/dashboard";
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user]);

  // Prevent back navigation to dashboard after logout
  if (!user && window.location.pathname === "/dashboard") {
    return <Navigate to="/login" replace />;
  }

  // Prevent access to login/register if already logged in
  if (
    user &&
    (window.location.pathname === "/login" ||
      window.location.pathname === "/register")
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
      <Toaster />
    </Router>
  </AuthProvider>
);

export default App;
