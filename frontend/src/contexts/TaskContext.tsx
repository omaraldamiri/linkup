import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { TaskDTO, TaskStatus, CreateTaskPayload } from "../types/taskDtos";
import * as taskService from "../services/taskService";

// ── Context value shape ───────────────────────────────────────────────────────

export interface TaskContextValue {
  tasks: TaskDTO[];
  currentTask: TaskDTO | null;
  tasksLoading: boolean;
  /** Tasks across all projects in the current workspace (user must be on each project). */
  workspaceTaskCount: number;
  workspaceTaskCountLoading: boolean;
  workspaceTasks: TaskDTO[];
  workspaceTasksLoading: boolean;

  selectTask: (id: string) => void;
  createTask: (projectId: string, data: CreateTaskPayload) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  changeAssignee: (taskId: string, assigneeEmail: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const defaultValue: TaskContextValue = {
  tasks: [],
  currentTask: null,
  tasksLoading: false,
  workspaceTaskCount: 0,
  workspaceTaskCountLoading: false,
  workspaceTasks: [],
  workspaceTasksLoading: false,
  selectTask: () => {},
  createTask: async () => {},
  deleteTask: async () => {},
  updateTaskStatus: async () => {},
  changeAssignee: async () => {},
  refreshTasks: async () => {},
};

export const TaskContext = createContext<TaskContextValue>(defaultValue);

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * Project task list is scoped via projectId; workspace task total via workspaceId (TaskBridge).
 *
 * Wire up in main.tsx via TaskBridge (same pattern as ProjectBridge):
 *
 *   const TaskBridge = ({ children }) => {
 *     const { currentWorkspace } = useWorkspace();
 *     const { currentProject } = useProject();
 *     return (
 *       <TaskProvider
 *         workspaceId={currentWorkspace?.id ?? null}
 *         projectId={currentProject?.id ?? null}
 *       >
 *         {children}
 *       </TaskProvider>
 *     );
 *   };
 *
 * Must sit inside ProjectProvider in the context tree:
 *
 *   AuthProvider
 *     └── WorkspaceBridge → WorkspaceProvider
 *           └── UserBridge → UserProvider
 *                 └── ProjectBridge → ProjectProvider
 *                       └── TaskBridge → TaskProvider   ← here
 *                             └── App
 */
const TaskProvider = ({
  children,
  workspaceId,
  projectId,
}: {
  children: ReactNode;
  workspaceId: string | null;
  projectId: string | null;
}) => {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskDTO | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [workspaceTaskCount, setWorkspaceTaskCount] = useState(0);
  const [workspaceTaskCountLoading, setWorkspaceTaskCountLoading] =
    useState(false);
  const [workspaceTasks, setWorkspaceTasks] = useState<TaskDTO[]>([]);
  const [workspaceTasksLoading, setWorkspaceTasksLoading] = useState(false);

  // ── Workspace-wide tasks (Dashboard, Team stats, etc.) ───────────────────

  useEffect(() => {
    if (!workspaceId) {
      setWorkspaceTaskCount(0);
      setWorkspaceTaskCountLoading(false);
      setWorkspaceTasks([]);
      setWorkspaceTasksLoading(false);
      return;
    }

    const load = async () => {
      setWorkspaceTaskCountLoading(true);
      setWorkspaceTasksLoading(true);
      try {
        const [n, tasks] = await Promise.all([
          taskService.getWorkspaceTaskCount(workspaceId),
          taskService.getWorkspaceTasks(workspaceId),
        ]);
        setWorkspaceTaskCount(n);
        setWorkspaceTasks(tasks);
      } catch {
        setWorkspaceTaskCount(0);
        setWorkspaceTasks([]);
      } finally {
        setWorkspaceTaskCountLoading(false);
        setWorkspaceTasksLoading(false);
      }
    };

    load();
  }, [workspaceId]);

  // ── Fetch tasks when project changes ─────────────────────────────────────

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setCurrentTask(null);
      return;
    }

    const fetch = async () => {
      setTasksLoading(true);
      try {
        const data = await taskService.getProjectTasks(projectId);
        setTasks(data);
      } catch {
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetch();
  }, [projectId]);

  // Keep currentTask in sync when the task list refreshes
  useEffect(() => {
    if (!currentTask) return;

    // If the current task no longer belongs to the active project, deselect it
    if (currentTask.projectId !== projectId) {
      setCurrentTask(null);
      return;
    }

    const fresh = tasks.find((t) => t.id === currentTask.id);
    if (fresh && fresh !== currentTask) setCurrentTask(fresh);
  }, [tasks, projectId]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const selectTask = (id: string): void => {
    setCurrentTask(tasks.find((t) => t.id === id) ?? null);
  };

  const refreshTasks = async (): Promise<void> => {
    if (!projectId) return;
    setTasksLoading(true);
    try {
      const data = await taskService.getProjectTasks(projectId);
      setTasks(data);
    } catch {
      // Non-fatal
    } finally {
      setTasksLoading(false);
    }
  };

  const createTask = async (
    pid: string,
    data: CreateTaskPayload,
  ): Promise<void> => {
    const created = await taskService.createTask(pid, data);
    setTasks((prev) => [...prev, created]);
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    await taskService.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (currentTask?.id === taskId) setCurrentTask(null);
  };

  const updateTaskStatus = async (
    taskId: string,
    status: TaskStatus,
  ): Promise<void> => {
    await taskService.updateTaskStatus(taskId, status);
    // Optimistic update — no re-fetch needed, backend just sets the status field
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, taskStatus: status } : t)),
    );
    if (currentTask?.id === taskId) {
      setCurrentTask((prev) => (prev ? { ...prev, taskStatus: status } : prev));
    }
  };

  const changeAssignee = async (
    taskId: string,
    assigneeEmail: string,
  ): Promise<void> => {
    await taskService.changeAssignee(taskId, assigneeEmail);
    // Optimistic update — reflect new assignee locally
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assigneeEmail } : t)),
    );
    if (currentTask?.id === taskId) {
      setCurrentTask((prev) => (prev ? { ...prev, assigneeEmail } : prev));
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        currentTask,
        tasksLoading,
        workspaceTaskCount,
        workspaceTaskCountLoading,
        workspaceTasks,
        workspaceTasksLoading,
        selectTask,
        createTask,
        deleteTask,
        updateTaskStatus,
        changeAssignee,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider;
