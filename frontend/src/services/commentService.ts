import api from "./api";
import type { CommentDTO } from "../types/commentDtos";

/**
 * Pure HTTP wrappers for the /comments endpoints.
 * No state, no side effects — context actions call these, components never do.
 */

/**
 * POST /comments/create/{taskId}?content=...  →  CommentDTO
 *
 * The backend reads `content` as a @RequestParam, not a request body.
 * Sending it in the body would silently fail — it must be a query param.
 */
export const createComment = (
  taskId: string,
  content: string,
): Promise<CommentDTO> =>
  api
    .post<CommentDTO>(`/comments/create/${taskId}`, null, {
      params: { content },
    })
    .then((r) => r.data);

/**
 * GET /comments/get/{taskId}  →  CommentDTO[]
 */
export const getComments = (taskId: string): Promise<CommentDTO[]> =>
  api.get<CommentDTO[]>(`/comments/get/${taskId}`).then((r) => r.data);
