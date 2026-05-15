import { createContext, useCallback, useState } from "react";
import type { ReactNode } from "react";
import * as adminService from "../services/adminService";
import type {
  AdminStatsDTO,
  AdminUserRowDTO,
  AdminWorkspaceRowDTO,
  PagedResponseDTO,
} from "../types/adminDtos";

export interface AdminContextValue {
  stats: AdminStatsDTO | null;
  statsLoading: boolean;
  users: PagedResponseDTO<AdminUserRowDTO> | null;
  usersLoading: boolean;
  workspaces: PagedResponseDTO<AdminWorkspaceRowDTO> | null;
  workspacesLoading: boolean;
  fetchStats: () => Promise<void>;
  fetchUsers: (q?: string, page?: number, size?: number) => Promise<void>;
  fetchWorkspaces: (q?: string, page?: number, size?: number) => Promise<void>;
  setUserEnabled: (userId: string, enabled: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<AdminStatsDTO | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [users, setUsers] = useState<PagedResponseDTO<AdminUserRowDTO> | null>(
    null,
  );
  const [usersLoading, setUsersLoading] = useState(false);
  const [workspaces, setWorkspaces] =
    useState<PagedResponseDTO<AdminWorkspaceRowDTO> | null>(null);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await adminService.getAdminStats());
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(
    async (q = "", page = 0, size = 20) => {
      setUsersLoading(true);
      try {
        setUsers(await adminService.listAdminUsers(q, page, size));
      } finally {
        setUsersLoading(false);
      }
    },
    [],
  );

  const fetchWorkspaces = useCallback(
    async (q = "", page = 0, size = 20) => {
      setWorkspacesLoading(true);
      try {
        setWorkspaces(await adminService.listAdminWorkspaces(q, page, size));
      } finally {
        setWorkspacesLoading(false);
      }
    },
    [],
  );

  const setUserEnabled = useCallback(
    async (userId: string, enabled: boolean) => {
      const updated = await adminService.setUserEnabled(userId, enabled);
      setUsers((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((u) => (u.id === userId ? updated : u)),
        };
      });
    },
    [],
  );

  const deleteUser = useCallback(async (userId: string) => {
    await adminService.deleteAdminUser(userId);
    setUsers((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        content: prev.content.filter((u) => u.id !== userId),
        totalElements: prev.totalElements - 1,
      };
    });
  }, []);

  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    await adminService.deleteAdminWorkspace(workspaceId);
    setWorkspaces((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        content: prev.content.filter((w) => w.id !== workspaceId),
        totalElements: prev.totalElements - 1,
      };
    });
  }, []);

  return (
    <AdminContext.Provider
      value={{
        stats,
        statsLoading,
        users,
        usersLoading,
        workspaces,
        workspacesLoading,
        fetchStats,
        fetchUsers,
        fetchWorkspaces,
        setUserEnabled,
        deleteUser,
        deleteWorkspace,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
