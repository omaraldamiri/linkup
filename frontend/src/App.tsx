import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";
import useAuth from "./hooks/useAuth";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Layout from "./pages/Layout";
import Auth from "./pages/Auth";
import OAuthCallback from "./pages/OAuthCallback";

interface RouteProps {
  children: ReactNode;
}

// Redirects unauthenticated users to /auth
const ProtectedRoute = ({ children }: RouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-950">
        <span className="size-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Redirects already-authenticated users away from /auth
const PublicRoute = ({ children }: RouteProps) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route path="/oauth2/callback" element={<OAuthCallback />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectsDetail" element={<ProjectDetails />} />
          <Route path="taskDetails" element={<TaskDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
