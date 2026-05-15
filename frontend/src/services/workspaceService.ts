import api from "./api";
import type {
  UserRoleDTO,
  CreateWorkspacePayload,
  EditingRoleDTO,
  AddingMemberDTO,
  WorkspaceDTO,
  PendingWorkspaceInvitationDTO,
} from "../types/workspaceDtos";

/** GET /workspaces/my — full workspace list for the authenticated user, including imageUrl */
export const getMyWorkspaces = async (): Promise<WorkspaceDTO[]> => {
  const res = await api.get<WorkspaceDTO[]>("/workspaces/my");
  return res.data;
};

/** GET /workspaces/getmembers/{workspaceId} */
export const getWorkspaceMembers = async (
  workspaceId: string,
): Promise<UserRoleDTO[]> => {
  const res = await api.get<UserRoleDTO[]>(
    `/workspaces/getmembers/${workspaceId}`,
  );
  return res.data;
};

/** POST /workspaces/create — returns the created WorkspaceDTO */
export const createWorkspace = async (
  data: CreateWorkspacePayload,
): Promise<WorkspaceDTO> => {
  const res = await api.post<WorkspaceDTO>("/workspaces/create", data);
  return res.data;
};

/** POST /workspaces/adduser — sends email invitation */
export const inviteMember = async (data: AddingMemberDTO): Promise<string> => {
  const res = await api.post<string>("/workspaces/adduser", data);
  return res.data;
};

/** GET /workspaces/pending-invitations/{workspaceId} — owner only */
export const getPendingInvitations = async (
  workspaceId: string,
): Promise<PendingWorkspaceInvitationDTO[]> => {
  const res = await api.get<PendingWorkspaceInvitationDTO[]>(
    `/workspaces/pending-invitations/${workspaceId}`,
  );
  return res.data;
};

/** POST /workspaces/invitations/accept */
export const acceptWorkspaceInvitation = async (
  token: string,
): Promise<string> => {
  const res = await api.post<string>("/workspaces/invitations/accept", {
    token,
  });
  return res.data;
};

/** DELETE /workspaces/invitations/{invitationId} — owner only */
export const revokeWorkspaceInvitation = async (
  invitationId: string,
): Promise<string> => {
  const res = await api.delete<string>(
    `/workspaces/invitations/${invitationId}`,
  );
  return res.data;
};

/** DELETE /workspaces/removeuser/{workspaceId}/{userId} */
export const removeMember = async (
  workspaceId: string,
  userId: string,
): Promise<string> => {
  const res = await api.delete<string>(
    `/workspaces/removeuser/${workspaceId}/${userId}`,
  );
  return res.data;
};

/** PATCH /workspaces/editrole */
export const editMemberRole = async (data: EditingRoleDTO): Promise<string> => {
  const res = await api.patch<string>("/workspaces/editrole", data);
  return res.data;
};

/** DELETE /workspaces/delete/{workspaceId} */
export const deleteWorkspace = async (workspaceId: string): Promise<string> => {
  const res = await api.delete<string>(`/workspaces/delete/${workspaceId}`);
  return res.data;
};
