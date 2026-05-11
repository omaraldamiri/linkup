import { useContext } from "react";
import {
  WorkspaceContext,
  type WorkspaceContextValue,
} from "../contexts/WorkspaceContext";

const useWorkspace = (): WorkspaceContextValue => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  }
  return ctx;
};

export default useWorkspace;
