import api from "./api";
import type { TaskDTO, TaskStatus, CreateTaskPayload } from "../types/taskDtos";

/**
 * Pure HTTP wrappers for the /tasks endpoints.
 * No state, no side effects — context actions call these, components never do.
 */

/** POST /tasks/create/{projectId} → TaskDTO */
export const createTask = (
  projectId: string,
  data: CreateTaskPayload,
): Promise<TaskDTO> =>
  api.post<TaskDTO>(`/tasks/create/${projectId}`, data).then((r) => r.data);

/** DELETE /tasks/delete/{taskId} → String */
export const deleteTask = (taskId: string): Promise<string> =>
  api.delete<string>(`/tasks/delete/${taskId}`).then((r) => r.data);

/**
 * PATCH /tasks/updatestatus/{taskId}?status=STATUS → String
 * Status is sent as a query param, not a body.
 */
export const updateTaskStatus = (
  taskId: string,
  status: TaskStatus,
): Promise<string> =>
  api
    .patch<string>(`/tasks/updatestatus/${taskId}`, null, {
      params: { status },
    })
    .then((r) => r.data);

/**
 * PATCH /tasks/changeassignee/{taskId}?assigneeEmail=EMAIL → String
 * assigneeEmail is sent as a query param, not a body.
 */
export const changeAssignee = (
  taskId: string,
  assigneeEmail: string,
): Promise<string> =>
  api
    .patch<string>(`/tasks/changeassignee/${taskId}`, null, {
      params: { assigneeEmail },
    })
    .then((r) => r.data);

/** GET /tasks/get/{taskId} → TaskDTO */
export const getTask = (taskId: string): Promise<TaskDTO> =>
  api.get<TaskDTO>(`/tasks/get/${taskId}`).then((r) => r.data);

/** GET /tasks/getall/{projectId} → TaskDTO[] */
export const getProjectTasks = (projectId: string): Promise<TaskDTO[]> =>
  api.get<TaskDTO[]>(`/tasks/getall/${projectId}`).then((r) => r.data);

/** GET /tasks/count/workspace/{workspaceId} → number */
export const getWorkspaceTaskCount = (workspaceId: string): Promise<number> =>
  api
    .get<number>(`/tasks/count/workspace/${workspaceId}`)
    .then((r) => r.data);

/** GET /tasks/workspace/{workspaceId} → TaskDTO[] */
export const getWorkspaceTasks = (workspaceId: string): Promise<TaskDTO[]> =>
  api
    .get<TaskDTO[]>(`/tasks/workspace/${workspaceId}`)
    .then((r) => r.data);
