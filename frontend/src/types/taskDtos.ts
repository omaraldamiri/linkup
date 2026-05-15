// ── Enums ─────────────────────────────────────────────────────────────────────

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type TaskType = "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER";

// ── Core DTO ──────────────────────────────────────────────────────────────────

/**
 * Maps to TaskDTO.java.
 *
 * ⚠️  BACKEND DEPENDENCY: TaskDTO.java does not currently include an `id` field.
 * Every mutating endpoint (delete, updatestatus, changeassignee) and the single-
 * task GET use a taskId path param, so without `id` in the response the entire
 * task domain is non-functional. Your partner must add `private String id;`
 * (populated in every builder chain via `.id(task.getId())`) to TaskDTO.java
 * before any of the delete / update / changeAssignee actions can work.
 *
 * ⚠️  DATE FORMAT: Spring's Jackson serializer will send LocalDateTime fields
 * as arrays ([2026, 5, 14, 10, 30, 0]) unless @JsonFormat(shape = STRING) is
 * applied on the entity or a global ObjectMapper config is set. If dates arrive
 * as arrays instead of ISO-8601 strings, ask your partner to add:
 *   @JsonFormat(shape = JsonFormat.Shape.STRING)
 * on dueTime, createdAt, and updatedAt in TaskDTO.java.
 * (Same issue already noted for ProjectDTO in projectDtos.ts.)
 */
export interface TaskDTO {
  /** ⚠️ Requires backend fix — see note above. */
  id: string;
  title: string;
  description: string | null;
  taskStatus: TaskStatus;
  taskPriority: TaskPriority;
  taskType: TaskType;
  /** ISO-8601 string — see date format note above. */
  dueTime: string | null;
  /** ISO-8601 string */
  createdAt: string | null;
  /** ISO-8601 string */
  updatedAt: string | null;
  /** Email of the assigned user. */
  assigneeEmail: string;
  projectId: string;
}

// ── Write payloads ────────────────────────────────────────────────────────────

/**
 * Body for POST /tasks/create/{projectId}.
 *
 * The backend ignores taskStatus on create (always sets TODO).
 * projectId in the body is also ignored — the path param is used.
 * Only send what the service actually reads.
 */
export interface CreateTaskPayload {
  title: string;
  assigneeEmail: string;
  description?: string;
  taskPriority?: TaskPriority;
  taskType?: TaskType;
  /** ISO-8601 string, e.g. "2026-06-30T17:00:00" */
  dueTime?: string;
}

/**
 * Used internally for the updateTaskStatus call.
 * Sent as a query param (?status=IN_PROGRESS), not a body.
 */
export type UpdateTaskStatusPayload = TaskStatus;
