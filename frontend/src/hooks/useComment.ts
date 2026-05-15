import { useContext } from "react";
import {
  CommentContext,
  type CommentContextValue,
} from "../contexts/CommentContext";

/**
 * Access comment state and actions for the currently selected task.
 *
 * Separated from CommentContext.tsx for Vite fast-refresh compatibility —
 * hooks (non-components) and provider components must live in separate files.
 *
 * @throws if used outside <CommentProvider>
 */
const useComment = (): CommentContextValue => {
  const ctx = useContext(CommentContext);
  if (!ctx) {
    throw new Error("useComment must be used inside <CommentProvider>");
  }
  return ctx;
};

export default useComment;
