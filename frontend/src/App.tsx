import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";
import useAuth from "./hooks/useAuth";
import { isSafeInternalReturnPath } from "./utils/safeReturnPath";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import WorkspaceInviteAccept from "./pages/WorkspaceInviteAccept";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Layout from "./pages/Layout";
import Auth from "./pages/Auth";
import OAuthCallback from "./pages/OAuthCallback";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminWorkspaces from "./pages/admin/AdminWorkspaces";

interface RouteProps {
  children: ReactNode;
}

// Redirects unauthenticated users to /auth (preserves return path for post-login)
const ProtectedRoute = ({ children }: RouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-950">
        <span className="size-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}`,
    );
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  return <>{children}</>;
};

// Redirects already-authenticated users away from /auth (honours ?next= when safe)
const PublicRoute = ({ children }: RouteProps) => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  if (loading) return null;
  if (user) {
    const next = searchParams.get("next");
    if (isSafeInternalReturnPath(next)) {
      return <Navigate to={next} replace />;
    }
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: RouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <span className="size-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.systemAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
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
          <Route path="team/invite" element={<WorkspaceInviteAccept />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectsDetail" element={<ProjectDetails />} />
          <Route path="taskDetails" element={<TaskDetails />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="workspaces" element={<AdminWorkspaces />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
