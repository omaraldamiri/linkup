import { useContext } from "react";
import { ProjectContext } from "../contexts/ProjectContext";
import type { ProjectContextValue } from "../contexts/ProjectContext";

const useProject = (): ProjectContextValue => {
  return useContext(ProjectContext);
};

export default useProject;
