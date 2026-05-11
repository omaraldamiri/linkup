import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as authService from "../services/authService";
import * as userService from "../services/userService";
import * as workspaceService from "../services/workspaceService";
import type { LoginDTO, RegisterDTO } from "../types/authDtos";
import type { UserDTO } from "../types/userDtos";
import type { WorkspaceDTO } from "../types/workspaceDtos";

// ── Storage keys ──────────────────────────────────────────────────────────────
const TOKEN_KEY = "token";
const USER_KEY = "user";
const WORKSPACES_KEY = "workspaces";

export interface AuthContextValue {
  // state
  user: UserDTO | null;
  workspaces: WorkspaceDTO[];
  loading: boolean;

  // actions
  login: (credentials: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  loginWithGoogle: () => void;
  handleOAuthCallback: (
    token: string,
    user: UserDTO,
    workspaces: WorkspaceDTO[],
  ) => void;
  /**
   * Re-fetches the authenticated user from GET /users/me and syncs state +
   * localStorage. Called after OAuth callback because the redirect URL
   * intentionally omits the base64 image to stay under nginx's header buffer limit.
   */
  refreshUser: () => Promise<void>;
  /**
   * Re-fetches the authenticated user's workspaces from GET /workspaces/my and
   * syncs state + localStorage. Called after OAuth callback for the same reason
   * as refreshUser — workspace imageUrls are stripped from the redirect payload.
   */
  refreshWorkspaces: () => Promise<void>;
  /**
   * The canonical way to mutate the workspace list from outside AuthContext.
   * Writes to both React state and localStorage atomically so that create/delete
   * workspace operations survive a page refresh. WorkspaceBridge uses this
   * instead of the raw setWorkspaces setter, which only updates in-memory state
   * and leaves localStorage stale.
   */
  updateWorkspaces: (updated: WorkspaceDTO[]) => void;
  logout: () => void;

  // setters — escape hatches, prefer updateWorkspaces for workspace mutations
  setUser: React.Dispatch<React.SetStateAction<UserDTO | null>>;
  setWorkspaces: React.Dispatch<React.SetStateAction<WorkspaceDTO[]>>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Bootstrap: read persisted data from localStorage — no API calls needed
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const storedWorkspaces = localStorage.getItem(WORKSPACES_KEY);
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedWorkspaces) setWorkspaces(JSON.parse(storedWorkspaces));
    } catch {
      // Corrupted storage — clean up
      _clearStorage();
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Private helpers ────────────────────────────────────────────────────────

  const _clearStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(WORKSPACES_KEY);
  };

  const _applyAuthResponse = (
    token: string,
    userData: UserDTO,
    workspaceData: WorkspaceDTO[],
  ): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaceData));
    setUser(userData);
    setWorkspaces(workspaceData);
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const login = async (credentials: LoginDTO): Promise<void> => {
    const { token, userDTO, workspaceDTOList } =
      await authService.login(credentials);
    _applyAuthResponse(token, userDTO, workspaceDTOList);
  };

  const register = async (data: RegisterDTO): Promise<void> => {
    const { token, userDTO, workspaceDTOList } =
      await authService.register(data);
    _applyAuthResponse(token, userDTO, workspaceDTOList);
  };

  const loginWithGoogle = (): void => {
    authService.loginWithGoogle();
  };

  const handleOAuthCallback = (
    token: string,
    userData: UserDTO,
    workspaceData: WorkspaceDTO[],
  ): void => {
    _applyAuthResponse(token, userData, workspaceData);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const freshUser = await userService.getMe();
      localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      setUser(freshUser);
    } catch {
      // Non-fatal: user is authenticated, image just won't show until next session
    }
  };

  const refreshWorkspaces = async (): Promise<void> => {
    try {
      const freshWorkspaces = await workspaceService.getMyWorkspaces();
      localStorage.setItem(WORKSPACES_KEY, JSON.stringify(freshWorkspaces));
      setWorkspaces(freshWorkspaces);
    } catch {
      // Non-fatal: workspace list is intact, images just won't show until next session
    }
  };

  const updateWorkspaces = (updated: WorkspaceDTO[]): void => {
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(updated));
    setWorkspaces(updated);
  };

  const logout = (): void => {
    _clearStorage();
    setUser(null);
    setWorkspaces([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        loading,
        login,
        register,
        loginWithGoogle,
        handleOAuthCallback,
        refreshUser,
        refreshWorkspaces,
        updateWorkspaces,
        logout,
        setUser,
        setWorkspaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
