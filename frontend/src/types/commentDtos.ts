// ── Core DTO ──────────────────────────────────────────────────────────────────

/**
 * Maps to CommentDTO.java.
 *
 * No `id` field — delete is not implemented and therefore not needed.
 * If delete is added later, ask your partner to include `private String id;`
 * in CommentDTO.java and populate it in every builder chain.
 *
 * ⚠️  DATE FORMAT: createdAt is a LocalDateTime on the backend. Jackson will
 * serialize it as an array ([2026, 5, 14, 10, 30, 0]) unless @JsonFormat is
 * configured globally or per-field. If dates arrive as arrays, the formatDate
 * helper in TaskDetails will silently return "—". Ask your partner to add:
 *   @JsonFormat(shape = JsonFormat.Shape.STRING)
 * on the createdAt field in CommentDTO.java.
 */
export interface CommentDTO {
  content: string;
  userEmail: string;
  taskId: string;
  /** ISO-8601 string — see date format note above. */
  createdAt: string | null;
}
