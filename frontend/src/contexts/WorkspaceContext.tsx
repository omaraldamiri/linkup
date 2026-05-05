import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type {
  WorkspaceDTO,
  UserRoleDTO,
  WorkspaceRole,
  AddingMemberDTO,
  EditingRoleDTO,
  CreateWorkspacePayload,
} from "../types/workspaceDtos";
import * as workspaceService from "../services/workspaceService";

export interface WorkspaceContextValue {
  currentWorkspace: WorkspaceDTO | null;
  members: UserRoleDTO[];
  membersLoading: boolean;
  selectWorkspace: (id: string) => void;
  createWorkspace: (data: CreateWorkspacePayload) => Promise<void>;
  inviteMember: (data: AddingMemberDTO) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  editMemberRole: (data: EditingRoleDTO) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

// Safe default — prevents null destructure crashes during transitional renders
const defaultValue: WorkspaceContextValue = {
  currentWorkspace: null,
  members: [],
  membersLoading: false,
  selectWorkspace: () => {},
  createWorkspace: async () => {},
  inviteMember: async () => {},
  removeMember: async () => {},
  editMemberRole: async () => {},
  deleteWorkspace: async () => {},
};

export const WorkspaceContext =
  createContext<WorkspaceContextValue>(defaultValue);

const WorkspaceProvider = ({
  children,
  workspaces,
  onWorkspacesChange,
}: {
  children: ReactNode;
  workspaces: WorkspaceDTO[];
  onWorkspacesChange: (updated: WorkspaceDTO[]) => void;
}) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceDTO | null>(
    null,
  );
  const [members, setMembers] = useState<UserRoleDTO[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Sync currentWorkspace whenever the workspaces list changes.
  //
  // Two cases handled:
  // 1. No workspace selected yet → auto-select first (initial load / just logged in).
  // 2. A workspace IS already selected → replace it with the fresh object from the
  //    updated list. This is critical for OAuth login: the initial payload delivers
  //    imageUrl: null, then refreshWorkspaces() re-fetches the real data and updates
  //    the list. Without this second branch the old guard (!currentWorkspace) would
  //    block the update and the image would stay null until the user manually
  //    re-selected the workspace or refreshed the page.
  useEffect(() => {
    if (workspaces.length === 0) {
      setCurrentWorkspace(null);
      setMembers([]);
      return;
    }

    if (!currentWorkspace) {
      // Nothing selected yet — pick the first workspace
      setCurrentWorkspace(workspaces[0]);
      return;
    }

    // Already selected — sync it with the fresh list entry so fields like
    // imageUrl reflect the latest data without forcing a re-select.
    const fresh = workspaces.find((ws) => ws.id === currentWorkspace.id);
    if (fresh && fresh !== currentWorkspace) {
      setCurrentWorkspace(fresh);
    }
  }, [workspaces]);

  // Fetch members whenever selected workspace changes
  useEffect(() => {
    if (!currentWorkspace) {
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const data = await workspaceService.getWorkspaceMembers(
          currentWorkspace.id,
        );
        setMembers(data);
      } catch {
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [currentWorkspace?.id]);

  const selectWorkspace = (id: string): void => {
    const found = workspaces.find((ws) => ws.id === id) ?? null;
    setCurrentWorkspace(found);
  };

  const createWorkspace = async (
    data: CreateWorkspacePayload,
  ): Promise<void> => {
    const created = await workspaceService.createWorkspace(data);
    const updated = [...workspaces, created];
    onWorkspacesChange(updated);
    setCurrentWorkspace(created);
  };

  const inviteMember = async (data: AddingMemberDTO): Promise<void> => {
    await workspaceService.inviteMember(data);
    if (currentWorkspace) {
      const updated = await workspaceService.getWorkspaceMembers(
        currentWorkspace.id,
      );
      setMembers(updated);
    }
  };

  const removeMember = async (
    workspaceId: string,
    userId: string,
  ): Promise<void> => {
    await workspaceService.removeMember(workspaceId, userId);
    setMembers((prev) => prev.filter((m) => m.userDTO.id !== userId));
  };

  const editMemberRole = async (data: EditingRoleDTO): Promise<void> => {
    await workspaceService.editMemberRole(data);
    setMembers((prev) =>
      prev.map((m) =>
        m.userDTO.id === data.userId
          ? { ...m, role: data.newRole as WorkspaceRole }
          : m,
      ),
    );
  };

  const deleteWorkspace = async (workspaceId: string): Promise<void> => {
    await workspaceService.deleteWorkspace(workspaceId);
    const updated = workspaces.filter((ws) => ws.id !== workspaceId);
    onWorkspacesChange(updated);
    setCurrentWorkspace(updated[0] ?? null);
    setMembers([]);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        members,
        membersLoading,
        selectWorkspace,
        createWorkspace,
        inviteMember,
        removeMember,
        editMemberRole,
        deleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;
