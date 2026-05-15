import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";

import AuthProvider from "./contexts/AuthContext";
import WorkspaceProvider from "./contexts/WorkspaceContext";
import UserProvider from "./contexts/UserContext";
import ProjectProvider from "./contexts/ProjectContext";
import TaskProvider from "./contexts/TaskContext";
import CommentProvider from "./contexts/CommentContext";
import AdminProvider from "./contexts/AdminContext";

import useWorkspace from "./hooks/useWorkspace";
import App from "./App";
import "./index.css";

import useProject from "./hooks/useProject";
import useAuth from "./hooks/useAuth";
import useTask from "./hooks/useTask";

// ── WorkspaceBridge ────────────────────────────────────────────────────────────
const WorkspaceBridge = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  return (
    <WorkspaceProvider
      workspaces={auth?.workspaces ?? []}
      onWorkspacesChange={(updated) => auth?.updateWorkspaces(updated)}
    >
      {children}
    </WorkspaceProvider>
  );
};

// ── UserBridge ─────────────────────────────────────────────────────────────────
const UserBridge = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  return (
    <UserProvider
      onUserChange={(updated) =>
        auth?.setUser((prev) => (prev ? { ...prev, ...updated } : prev))
      }
      onUserDelete={() => auth?.logout()}
    >
      {children}
    </UserProvider>
  );
};

// ── ProjectBridge ──────────────────────────────────────────────────────────────
// Feeds the current workspace id into ProjectProvider so it can scope
// its project list. Must live inside WorkspaceProvider.
const ProjectBridge = ({ children }: { children: React.ReactNode }) => {
  const { currentWorkspace } = useWorkspace();
  return (
    <ProjectProvider workspaceId={currentWorkspace?.id ?? null}>
      {children}
    </ProjectProvider>
  );
};

// ── TaskBridge ─────────────────────────────────────────────────────────────────
const TaskBridge = ({ children }: { children: React.ReactNode }) => {
  const { currentWorkspace } = useWorkspace();
  const { currentProject } = useProject();
  return (
    <TaskProvider
      workspaceId={currentWorkspace?.id ?? null}
      projectId={currentProject?.id ?? null}
    >
      {children}
    </TaskProvider>
  );
};

// ── CommentBridge ──────────────────────────────────────────────────────────────
// Feeds the current task id into CommentProvider so it auto-fetches comments
// whenever the selected task changes. Must live inside TaskProvider.
const CommentBridge = ({ children }: { children: React.ReactNode }) => {
  const { currentTask } = useTask();
  return (
    <CommentProvider taskId={currentTask?.id ?? null}>
      {children}
    </CommentProvider>
  );
};

// ── Context tree ───────────────────────────────────────────────────────────────
// AuthProvider
//   └── WorkspaceBridge → WorkspaceProvider
//         └── UserBridge → UserProvider
//               └── ProjectBridge → ProjectProvider
//                     └── App
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <AuthProvider>
          <WorkspaceBridge>
            <UserBridge>
              <ProjectBridge>
                <TaskBridge>
                  <CommentBridge>
                    <AdminProvider>
                      <App />
                    </AdminProvider>
                  </CommentBridge>
                </TaskBridge>
              </ProjectBridge>
            </UserBridge>
          </WorkspaceBridge>
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
