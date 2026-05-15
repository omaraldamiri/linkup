import useAuth from "./useAuth";
import useWorkspace from "./useWorkspace";

/**
 * Whether the current user may create a project in the active workspace.
 * Workspace roles (OWNER | MEMBER) are separate from project roles (LEADER | VIEWER).
 * Any member of the current workspace may create a project — including when they
 * just created the workspace or were invited as a workspace member.
 */
const useCanCreateProject = (): boolean => {
  const { user } = useAuth();
  const { currentWorkspace, members } = useWorkspace();

  if (!currentWorkspace || !user) return false;

  return members.some((m) => m.userDTO.id === user.id);
};

export default useCanCreateProject;
