import api from "./api";
import type {
  AdminStatsDTO,
  AdminUserRowDTO,
  AdminWorkspaceRowDTO,
  PagedResponseDTO,
} from "../types/adminDtos";

export async function getAdminStats(): Promise<AdminStatsDTO> {
  const { data } = await api.get<AdminStatsDTO>("/admin/stats");
  return data;
}

export async function listAdminUsers(
  q = "",
  page = 0,
  size = 20,
): Promise<PagedResponseDTO<AdminUserRowDTO>> {
  const { data } = await api.get<PagedResponseDTO<AdminUserRowDTO>>(
    "/admin/users",
    { params: { q, page, size } },
  );
  return data;
}

export async function setUserEnabled(
  userId: string,
  enabled: boolean,
): Promise<AdminUserRowDTO> {
  const { data } = await api.patch<AdminUserRowDTO>(
    `/admin/users/${userId}/enabled`,
    { enabled },
  );
  return data;
}

export async function deleteAdminUser(userId: string): Promise<string> {
  const { data } = await api.delete<string>(`/admin/users/${userId}`);
  return data;
}

export async function listAdminWorkspaces(
  q = "",
  page = 0,
  size = 20,
): Promise<PagedResponseDTO<AdminWorkspaceRowDTO>> {
  const { data } = await api.get<PagedResponseDTO<AdminWorkspaceRowDTO>>(
    "/admin/workspaces",
    { params: { q, page, size } },
  );
  return data;
}

export async function deleteAdminWorkspace(workspaceId: string): Promise<string> {
  const { data } = await api.delete<string>(
    `/admin/workspaces/${workspaceId}`,
  );
  return data;
}
