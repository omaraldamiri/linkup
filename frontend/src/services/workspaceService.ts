import api from "./api";
import type {
  UserRoleDTO,
  CreateWorkspacePayload,
  EditingRoleDTO,
  AddingMemberDTO,
  WorkspaceDTO,
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

/** POST /workspaces/adduser */
export const inviteMember = async (data: AddingMemberDTO): Promise<string> => {
  const res = await api.post<string>("/workspaces/adduser", data);
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
