import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { CommentDTO } from "../types/commentDtos";
import * as commentService from "../services/commentService";

// ── Context value shape ───────────────────────────────────────────────────────

export interface CommentContextValue {
  comments: CommentDTO[];
  commentsLoading: boolean;
  /**
   * Posts a new comment on the current task.
   * The taskId is taken from the provider's prop — callers don't pass it.
   */
  createComment: (content: string) => Promise<void>;
}

const defaultValue: CommentContextValue = {
  comments: [],
  commentsLoading: false,
  createComment: async () => {},
};

export const CommentContext = createContext<CommentContextValue>(defaultValue);

// ── Provider ──────────────────────────────────────────────────────────────────
const CommentProvider = ({
  children,
  taskId,
}: {
  children: ReactNode;
  taskId: string | null;
}) => {
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // ── Fetch comments whenever the selected task changes ─────────────────────

  useEffect(() => {
    if (!taskId) {
      setComments([]);
      return;
    }

    const fetch = async () => {
      setCommentsLoading(true);
      try {
        const data = await commentService.getComments(taskId);
        setComments(data);
      } catch {
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetch();
  }, [taskId]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Posts a comment on the current task and appends the returned DTO to state.
   * Throws on error so the calling component can show a toast.
   */
  const createComment = async (content: string): Promise<void> => {
    if (!taskId) throw new Error("No task selected");
    const created = await commentService.createComment(taskId, content);
    setComments((prev) => [...prev, created]);
  };

  return (
    <CommentContext.Provider
      value={{ comments, commentsLoading, createComment }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export default CommentProvider;
