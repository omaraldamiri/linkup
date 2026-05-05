import { StrictMode, useContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import AuthProvider from "./contexts/AuthContext";
import WorkspaceProvider from "./contexts/WorkspaceContext";
import UserProvider from "./contexts/UserContext";
import { AuthContext } from "./contexts/AuthContext";
import App from "./App";
import "./index.css";

// ── WorkspaceBridge ────────────────────────────────────────────────────────────
// Feeds AuthContext.workspaces into WorkspaceProvider without a circular import.
//
// onWorkspacesChange uses auth.updateWorkspaces (not auth.setWorkspaces) so that
// create/delete workspace operations write to both React state AND localStorage.
// Using the raw setter only updates in-memory state — on page refresh the bootstrap
// reads localStorage and reverts to the pre-mutation list.
const WorkspaceBridge = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
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
// Feeds AuthContext.user callbacks into UserProvider.
// onUserChange: merges partial updates into the stored UserDTO.
// onUserDelete: calls AuthContext.logout() to clear state + localStorage.
const UserBridge = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
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

// ── Context tree ───────────────────────────────────────────────────────────────
// AuthProvider
//   └── WorkspaceBridge → WorkspaceProvider
//         └── UserBridge → UserProvider
//               └── App
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <AuthProvider>
          <WorkspaceBridge>
            <UserBridge>
              <App />
            </UserBridge>
          </WorkspaceBridge>
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
