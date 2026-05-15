import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type {
  ProjectDTO,
  ProjectMemberRoleDTO,
  ProjectRole,
  ProjectStatus,
  CreateProjectPayload,
  UpdateProjectPayload,
  EditingProjectRoleDTO,
} from "../types/projectDtos";
import * as projectService from "../services/projectService";

// ── Context value shape ───────────────────────────────────────────────────────

export interface ProjectContextValue {
  projects: ProjectDTO[];
  currentProject: ProjectDTO | null;
  /** The authenticated user's role in currentProject. Null when no project is selected. */
  currentUserRole: ProjectRole | null;
  projectMembers: ProjectMemberRoleDTO[];
  projectsLoading: boolean;
  membersLoading: boolean;
  projectDetailLoading: boolean;

  selectProject: (id: string) => void;
  ensureProjectSelected: (id: string) => Promise<void>;
  createProject: (data: CreateProjectPayload) => Promise<void>;
  editProject: (id: string, data: UpdateProjectPayload) => Promise<void>;
  changeProjectStatus: (id: string, status: ProjectStatus) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addProjectMember: (projectId: string, userEmail: string) => Promise<void>;
  removeProjectMember: (projectId: string, userId: string) => Promise<void>;
  editProjectMemberRole: (data: EditingProjectRoleDTO) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const defaultValue: ProjectContextValue = {
  projects: [],
  currentProject: null,
  currentUserRole: null,
  projectMembers: [],
  projectsLoading: false,
  membersLoading: false,
  projectDetailLoading: false,
  selectProject: () => {},
  ensureProjectSelected: async () => {},
  createProject: async () => {},
  editProject: async () => {},
  changeProjectStatus: async () => {},
  deleteProject: async () => {},
  addProjectMember: async () => {},
  removeProjectMember: async () => {},
  editProjectMemberRole: async () => {},
  refreshProjects: async () => {},
};

export const ProjectContext = createContext<ProjectContextValue>(defaultValue);

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * Wire up in main.tsx via ProjectBridge (same pattern as WorkspaceBridge):
 *
 *   const ProjectBridge = ({ children }) => {
 *     const { currentWorkspace } = useWorkspace();
 *     return (
 *       <ProjectProvider workspaceId={currentWorkspace?.id ?? null}>
 *         {children}
 *       </ProjectProvider>
 *     );
 *   };
 *
 * Must sit inside WorkspaceProvider in the context tree.
 */
const ProjectProvider = ({
  children,
  workspaceId,
}: {
  children: ReactNode;
  workspaceId: string | null;
}) => {
  const [allProjects, setAllProjects] = useState<ProjectDTO[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectDTO | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMemberRoleDTO[]>(
    [],
  );
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);

  // Workspace-scoped view — derived, never stored separately
  const projects = workspaceId
    ? allProjects.filter((p) => p.workspaceId === workspaceId)
    : [];

  // Derived from currentProject — no extra state needed
  const currentUserRole: ProjectRole | null =
    currentProject?.currentUserRole ?? null;

  // ── Fetch all projects when workspace changes ──────────────────────────────

  useEffect(() => {
    if (!workspaceId) {
      setCurrentProject(null);
      setProjectMembers([]);
      return;
    }

    const fetch = async () => {
      setProjectsLoading(true);
      try {
        const data = await projectService.getUserProjects();
        setAllProjects(data);
      } catch {
        setAllProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetch();
  }, [workspaceId]);

  // Sync currentProject when the list refreshes or workspace switches
  useEffect(() => {
    if (!currentProject) return;

    if (currentProject.workspaceId !== workspaceId) {
      setCurrentProject(null);
      setProjectMembers([]);
      return;
    }

    const fresh = allProjects.find((p) => p.id === currentProject.id);
    if (fresh && fresh !== currentProject) setCurrentProject(fresh);
  }, [allProjects, workspaceId]);

  // ── Fetch members when currentProject changes ────────────────────────────

  useEffect(() => {
    if (!currentProject) {
      setProjectMembers([]);
      return;
    }

    const fetch = async () => {
      setMembersLoading(true);
      try {
        const data = await projectService.getProjectMembers(currentProject.id);
        setProjectMembers(data);
      } catch {
        setProjectMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };

    fetch();
  }, [currentProject?.id]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const selectProject = (id: string): void => {
    const found = allProjects.find((p) => p.id === id) ?? null;
    setCurrentProject(found);
  };

  const ensureProjectSelected = async (id: string): Promise<void> => {
    const found = allProjects.find((p) => p.id === id);
    if (found) {
      setCurrentProject(found);
      return;
    }
    setProjectDetailLoading(true);
    try {
      const details = await projectService.getProjectDetails(id);
      setCurrentProject(details);
      setAllProjects((prev) =>
        prev.some((p) => p.id === id) ? prev : [...prev, details],
      );
    } catch {
      setCurrentProject(null);
    } finally {
      setProjectDetailLoading(false);
    }
  };

  const refreshProjects = async (): Promise<void> => {
    setProjectsLoading(true);
    try {
      const data = await projectService.getUserProjects();
      setAllProjects(data);
    } catch {
      // Non-fatal
    } finally {
      setProjectsLoading(false);
    }
  };

  const createProject = async (data: CreateProjectPayload): Promise<void> => {
    const created = await projectService.createProject(data);
    setAllProjects((prev) => [...prev, created]);
    setCurrentProject(created);
  };

  const editProject = async (
    id: string,
    data: UpdateProjectPayload,
  ): Promise<void> => {
    await projectService.editProject(id, data);
    const updated = await projectService.getProjectDetails(id);
    setAllProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    if (currentProject?.id === id) setCurrentProject(updated);
  };

  const changeProjectStatus = async (
    id: string,
    status: ProjectStatus,
  ): Promise<void> => {
    await projectService.changeProjectStatus(id, status);
    setAllProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, projectStatus: status } : p)),
    );
    if (currentProject?.id === id) {
      setCurrentProject((prev) =>
        prev ? { ...prev, projectStatus: status } : prev,
      );
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    await projectService.deleteProject(id);
    setAllProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProject?.id === id) {
      const remaining = projects.filter((p) => p.id !== id);
      setCurrentProject(remaining[0] ?? null);
      setProjectMembers([]);
    }
  };

  const addProjectMember = async (
    projectId: string,
    userEmail: string,
  ): Promise<void> => {
    await projectService.addProjectMember(projectId, userEmail);
    if (currentProject?.id === projectId) {
      const updated = await projectService.getProjectMembers(projectId);
      setProjectMembers(updated);
    }
  };

  const removeProjectMember = async (
    projectId: string,
    userId: string,
  ): Promise<void> => {
    await projectService.removeProjectMember(projectId, userId);
    setProjectMembers((prev) => prev.filter((m) => m.userDTO.id !== userId));
  };

  const editProjectMemberRole = async (
    data: EditingProjectRoleDTO,
  ): Promise<void> => {
    await projectService.editProjectMemberRole(data);
    // Optimistic role update now that we have role data in the member list
    setProjectMembers((prev) =>
      prev.map((m) =>
        m.userDTO.id === data.userId ? { ...m, role: data.newRole } : m,
      ),
    );
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        currentUserRole,
        projectMembers,
        projectsLoading,
        membersLoading,
        projectDetailLoading,
        selectProject,
        ensureProjectSelected,
        createProject,
        editProject,
        changeProjectStatus,
        deleteProject,
        addProjectMember,
        removeProjectMember,
        editProjectMemberRole,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectProvider;
