import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  ChevronRightIcon,
  UsersIcon,
  SettingsIcon,
  KanbanIcon,
  ChartColumnIcon,
  CalendarIcon,
  ArrowRightIcon,
} from "lucide-react";
import useProject from "../hooks/useProject";
import type { ProjectDTO } from "../types/projectDtos";

// ── Sub-item definition ───────────────────────────────────────────────────────

interface SubItem {
  title: string;
  tab: string;
  icon: React.ElementType;
}

const BASE_SUB_ITEMS: SubItem[] = [
  { title: "Tasks", tab: "tasks", icon: KanbanIcon },
  { title: "Analytics", tab: "analytics", icon: ChartColumnIcon },
  { title: "Calendar", tab: "calendar", icon: CalendarIcon },
];

const getProjectSubItems = (project: ProjectDTO): SubItem[] => [
  ...BASE_SUB_ITEMS,
  project.currentUserRole === "LEADER"
    ? { title: "Settings", tab: "settings", icon: SettingsIcon }
    : { title: "Members", tab: "members", icon: UsersIcon },
];

// ── Component ─────────────────────────────────────────────────────────────────

const ProjectSidebar = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Real project list from context — scoped to the current workspace
  const { projects, selectProject } = useProject();

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );

  const toggleProject = (id: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isSubItemActive = (projectId: string, tab: string): boolean =>
    location.pathname === "/projectsDetail" &&
    searchParams.get("id") === projectId &&
    searchParams.get("tab") === tab;

  return (
    <div className="mt-6 px-3">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
          Projects
        </h3>
        <Link to="/projects">
          <button className="size-5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded flex items-center justify-center transition-colors duration-200">
            <ArrowRightIcon className="size-3" />
          </button>
        </Link>
      </div>

      <div className="space-y-1 px-3">
        {projects.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 px-3 py-2">
            No projects yet.
          </p>
        ) : (
          projects.map((project) => (
            <div key={project.id}>
              {/* Project row */}
              <button
                onClick={() => toggleProject(project.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronRightIcon
                  className={`size-3 text-gray-500 dark:text-zinc-400 transition-transform duration-200 ${expandedProjects.has(project.id) ? "rotate-90" : ""}`}
                />
                <div className="size-2 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate max-w-40 text-sm text-left">
                  {project.name}
                </span>
              </button>

              {/* Sub-items */}
              {expandedProjects.has(project.id) && (
                <div className="ml-5 mt-1 space-y-1">
                  {getProjectSubItems(project).map((subItem) => {
                    const active = isSubItemActive(project.id, subItem.tab);
                    return (
                      <Link
                        key={subItem.tab}
                        to={`/projectsDetail?id=${project.id}&tab=${subItem.tab}`}
                        onClick={() => selectProject(project.id)}
                        className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs ${
                          active
                            ? "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                            : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <subItem.icon className="size-3 shrink-0" />
                        {subItem.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;
