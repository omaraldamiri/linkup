import type { UserDTO } from "./userDtos";

export interface WorkspaceDTO {
  id: string;
  name: string;
  imageUrl: string | null;
  slug: string;
  description: string | null;
}

export type WorkspaceRole = "OWNER" | "MEMBER";

// Matches UserRoleDTO.java — returned by GET /workspaces/getmembers/{workspaceId}
export interface UserRoleDTO {
  userDTO: UserDTO;
  role: WorkspaceRole;
}

// POST /workspaces/create
export interface CreateWorkspacePayload {
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}

// POST /workspaces/adduser
export interface AddingMemberDTO {
  userEmail: string;
  workSpaceId: string;
  workSpaceRole: WorkspaceRole;
}

// PATCH /workspaces/editrole
export interface EditingRoleDTO {
  userId: string;
  workSpaceId: string;
  newRole: WorkspaceRole;
}

/** GET /workspaces/pending-invitations/{workspaceId} — owner only */
export interface PendingWorkspaceInvitationDTO {
  id: string;
  inviteeEmail: string;
  inviteeName: string;
  role: WorkspaceRole;
  createdAt: string;
  expiresAt: string;
}
