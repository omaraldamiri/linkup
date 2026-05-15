import { useContext } from "react";
import { TaskContext, type TaskContextValue } from "../contexts/TaskContext";

/**
 * Access task state and actions for the currently selected project.
 *
 * Separated from TaskContext.tsx for Vite fast-refresh compatibility —
 * hooks (non-components) and provider components must live in separate files.
 *
 * @throws if used outside <TaskProvider>
 */
const useTask = (): TaskContextValue => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTask must be used inside <TaskProvider>");
  }
  return ctx;
};

export default useTask;
