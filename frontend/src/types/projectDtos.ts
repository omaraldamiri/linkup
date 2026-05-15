import type { UserDTO } from "./userDtos";

// ── Enums ─────────────────────────────────────────────────────────────────────

export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH";

export type ProjectStatus =
  | "ACTIVE"
  | "PLANNING"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";

export type ProjectRole = "LEADER" | "VIEWER";

// ── Core DTO ──────────────────────────────────────────────────────────────────

/**
 * Maps to ProjectDTO.java.
 *
 * `currentUserRole` — the authenticated user's role in this project.
 * Populated on all read responses (getprojects, details, create).
 * Used to gate leader-only UI (edit, delete, manage members).
 *
 * `addedEmails` is write-only — the backend won't populate it on reads.
 *
 * Dates come back as ISO-8601 strings from Spring's Jackson serializer.
 * If dates arrive as arrays ([2026,1,15,...]), ask your partner to add
 * @JsonFormat(shape = JsonFormat.Shape.STRING) on the LocalDateTime fields.
 */
export interface ProjectDTO {
  id: string;
  name: string;
  description: string | null;
  projectPriority: ProjectPriority;
  projectStatus: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  progress: number | null;
  createdAt: string | null;
  workspaceId: string;
  addedEmails: string[] | null;
  currentUserRole: ProjectRole | null;
}

// ── Member DTO ────────────────────────────────────────────────────────────────

/**
 * Returned by GET /projects/getmembers/{projectId}.
 * Maps to ProjectMemberRoleDTO.java — includes role so the frontend
 * can gate remove/edit-role actions without a separate call.
 */
export interface ProjectMemberRoleDTO {
  userDTO: UserDTO;
  role: ProjectRole;
}

// ── Write payloads ────────────────────────────────────────────────────────────

/**
 * Body for POST /projects/create.
 * `projectStatus` and `progress` are ignored by the backend on create —
 * new projects always start as PLANNING with 0 progress.
 * `addedEmails` optionally batch-adds members as VIEWER on creation.
 */
export interface CreateProjectPayload {
  name: string;
  workspaceId: string;
  description?: string;
  projectPriority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  addedEmails?: string[];
}

/**
 * Body for PATCH /projects/editproject/{projectId}.
 * Maps to UpdateProjectDTO.java — all fields optional.
 * `projectStatus` can also be changed here, or via the cheaper
 * PATCH /projects/changestatus/{projectId} for single-field toggles.
 */
export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  projectPriority?: ProjectPriority;
  projectStatus?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  progress?: number;
}

/** Body for PATCH /projects/editrole — maps to EditingProjectRoleDTO.java */
export interface EditingProjectRoleDTO {
  userId: string;
  projectId: string;
  newRole: ProjectRole;
}
