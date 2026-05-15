import api from "./api";
import type {
  ProjectDTO,
  CreateProjectPayload,
  UpdateProjectPayload,
  EditingProjectRoleDTO,
  ProjectMemberRoleDTO,
  ProjectStatus,
} from "../types/projectDtos";

/** POST /projects/create */
export const createProject = async (
  data: CreateProjectPayload,
): Promise<ProjectDTO> => {
  const res = await api.post<ProjectDTO>("/projects/create", data);
  return res.data;
};

/**
 * GET /projects/getprojects
 * Returns ALL projects the user belongs to across all workspaces.
 * Filtering by workspace is done client-side in ProjectContext.
 */
export const getUserProjects = async (): Promise<ProjectDTO[]> => {
  const res = await api.get<ProjectDTO[]>("/projects/getprojects");
  return res.data;
};

/** GET /projects/details/{projectId} */
export const getProjectDetails = async (
  projectId: string,
): Promise<ProjectDTO> => {
  const res = await api.get<ProjectDTO>(`/projects/details/${projectId}`);
  return res.data;
};

/** PATCH /projects/editproject/{projectId} */
export const editProject = async (
  projectId: string,
  data: UpdateProjectPayload,
): Promise<string> => {
  const res = await api.patch<string>(
    `/projects/editproject/${projectId}`,
    data,
  );
  return res.data;
};

/**
 * PATCH /projects/changestatus/{projectId}?status=
 * Status is a @RequestParam — sent as a query param, not a body.
 */
export const changeProjectStatus = async (
  projectId: string,
  status: ProjectStatus,
): Promise<string> => {
  const res = await api.patch<string>(
    `/projects/changestatus/${projectId}`,
    null,
    { params: { status } },
  );
  return res.data;
};

/** DELETE /projects/delete/{projectId} */
export const deleteProject = async (projectId: string): Promise<string> => {
  const res = await api.delete<string>(`/projects/delete/${projectId}`);
  return res.data;
};

/**
 * GET /projects/getmembers/{projectId}
 * Returns role-aware member list (ProjectMemberRoleDTO[]).
 */
export const getProjectMembers = async (
  projectId: string,
): Promise<ProjectMemberRoleDTO[]> => {
  const res = await api.get<ProjectMemberRoleDTO[]>(
    `/projects/getmembers/${projectId}`,
  );
  return res.data;
};

/**
 * POST /projects/adduser/{projectId}?userEmail=
 * userEmail is a @RequestParam — query param, not body.
 */
export const addProjectMember = async (
  projectId: string,
  userEmail: string,
): Promise<string> => {
  const res = await api.post<string>(`/projects/adduser/${projectId}`, null, {
    params: { userEmail },
  });
  return res.data;
};

/** DELETE /projects/deleteuser/{projectId}/{userId} */
export const removeProjectMember = async (
  projectId: string,
  userId: string,
): Promise<string> => {
  const res = await api.delete<string>(
    `/projects/deleteuser/${projectId}/${userId}`,
  );
  return res.data;
};

/** PATCH /projects/editrole */
export const editProjectMemberRole = async (
  data: EditingProjectRoleDTO,
): Promise<string> => {
  const res = await api.patch<string>("/projects/editrole", data);
  return res.data;
};
