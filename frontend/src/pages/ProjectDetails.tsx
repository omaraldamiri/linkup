import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlusIcon,
  SettingsIcon,
  BarChart3Icon,
  CalendarIcon,
  FileStackIcon,
  ZapIcon,
  UsersIcon,
} from "lucide-react";
import useProject from "../hooks/useProject";
import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";
import { toast } from "sonner";
import type { ProjectStatus } from "../types/projectDtos";

const statusColors: Record<string, string> = {
  PLANNING: "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-200",
  ACTIVE:
    "bg-emerald-200 text-emerald-900 dark:bg-emerald-500 dark:text-emerald-900",
  ON_HOLD: "bg-amber-200 text-amber-900 dark:bg-amber-500 dark:text-amber-900",
  COMPLETED: "bg-blue-200 text-blue-900 dark:bg-blue-500 dark:text-blue-900",
  CANCELLED: "bg-red-200 text-red-900 dark:bg-red-500 dark:text-red-900",
};

const ALL_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
];

export default function ProjectDetail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const tabParam = searchParams.get("tab") || "tasks";

  const navigate = useNavigate();

  const {
    currentProject,
    currentUserRole,
    projectMembers,
    membersLoading,
    projects,
    projectsLoading,
    projectDetailLoading,
    selectProject,
    ensureProjectSelected,
    changeProjectStatus,
  } = useProject();

  const [activeTab, setActiveTab] = useState(tabParam);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  // Select the project when the URL id or loaded project list changes (fixes refresh)
  useEffect(() => {
    if (!id) return;
    const inList = projects.some((p) => p.id === id);
    if (inList) {
      selectProject(id);
    } else if (!projectsLoading) {
      void ensureProjectSelected(id);
    }
  }, [id, projects, projectsLoading, selectProject, ensureProjectSelected]);

  // Keep tab in sync with URL param
  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const isLeader = currentUserRole === "LEADER";

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!currentProject || status === currentProject.projectStatus) return;
    setChangingStatus(true);
    try {
      await changeProjectStatus(currentProject.id, status);
      toast.success(`Status changed to ${status.replace("_", " ")}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to change status");
    } finally {
      setChangingStatus(false);
    }
  };

  // Tab definitions differ by role:
  // - LEADER: tasks | calendar | analytics | settings
  // - VIEWER: tasks | calendar | analytics | members
  const tabs = [
    { key: "tasks", label: "Tasks", icon: FileStackIcon },
    { key: "calendar", label: "Calendar", icon: CalendarIcon },
    { key: "analytics", label: "Analytics", icon: BarChart3Icon },
    isLeader
      ? { key: "settings", label: "Settings", icon: SettingsIcon }
      : { key: "members", label: "Members", icon: UsersIcon },
  ];

  if (projectsLoading || projectDetailLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (!currentProject || currentProject.id !== id) {
    return (
      <div className="p-6 text-center text-zinc-900 dark:text-zinc-200">
        <p className="text-3xl md:text-5xl mt-40 mb-10">Project not found</p>
        <button
          onClick={() => navigate("/projects")}
          className="mt-4 px-4 py-2 rounded bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto text-zinc-900 dark:text-white">
      {/* Header */}
      <div className="flex max-md:flex-col gap-4 flex-wrap items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium">{currentProject.name}</h1>

            {/* Status badge — clickable dropdown for leaders */}
            {isLeader ? (
              <div className="relative">
                <select
                  value={currentProject.projectStatus}
                  disabled={changingStatus}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as ProjectStatus)
                  }
                  className={`px-2 py-1 rounded text-xs border-0 cursor-pointer appearance-none disabled:opacity-60 ${statusColors[currentProject.projectStatus] ?? ""}`}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span
                className={`px-2 py-1 rounded text-xs ${statusColors[currentProject.projectStatus] ?? ""}`}
              >
                {currentProject.projectStatus.replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        {/* New Task button — available to leaders only */}
        {isLeader && (
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          >
            <PlusIcon className="size-4" />
            New Task
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:flex flex-wrap gap-6">
        {[
          {
            label: "Progress",
            value: `${currentProject.progress ?? 0}%`,
            color: "text-zinc-900 dark:text-white",
          },
          {
            label: "Priority",
            value: currentProject.projectPriority ?? "—",
            color: "text-amber-700 dark:text-amber-400",
          },
          {
            label: "Team Members",
            value: projectMembers.length,
            color: "text-blue-700 dark:text-blue-400",
          },
          {
            label: "Your Role",
            value: currentUserRole ?? "—",
            color: isLeader
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-zinc-600 dark:text-zinc-400",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between sm:min-w-52 p-4 py-2.5 rounded"
          >
            <div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {card.label}
              </div>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </div>
            <ZapIcon className={`size-4 ${card.color}`} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div>
        <div className="inline-flex flex-wrap max-sm:grid grid-cols-3 gap-2 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => {
                setActiveTab(tabItem.key);
                setSearchParams({ id: id!, tab: tabItem.key });
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${activeTab === tabItem.key ? "bg-zinc-100 dark:bg-zinc-800/80" : "hover:bg-zinc-50 dark:hover:bg-zinc-700"}`}
            >
              <tabItem.icon className="size-3.5" />
              {tabItem.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {/* All three components now pull from context directly */}
          {activeTab === "tasks" && <ProjectTasks />}
          {activeTab === "analytics" && <ProjectAnalytics />}
          {activeTab === "calendar" && <ProjectCalendar />}

          {/* LEADER only */}
          {activeTab === "settings" && isLeader && <ProjectSettings />}

          {/* VIEWER only — read-only member list */}
          {activeTab === "members" && !isLeader && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">
                Team Members{" "}
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  ({projectMembers.length})
                </span>
              </h2>
              {membersLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded dark:bg-zinc-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : projectMembers.length === 0 ? (
                <p className="text-sm text-zinc-500">No members found.</p>
              ) : (
                <div className="space-y-2">
                  {projectMembers.map((m) => (
                    <div
                      key={m.userDTO.id}
                      className="flex items-center justify-between px-3 py-2 rounded dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-300"
                    >
                      <div className="flex items-center gap-2">
                        {m.userDTO.image ? (
                          <img
                            src={m.userDTO.image}
                            alt={m.userDTO.name}
                            className="size-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="size-6 rounded-full bg-zinc-600 flex items-center justify-center text-xs text-white">
                            {m.userDTO.name[0]?.toUpperCase()}
                          </div>
                        )}
                        <span>{m.userDTO.name}</span>
                        <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                          {m.userDTO.email}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ring ${m.role === "LEADER" ? "ring-emerald-300 dark:ring-emerald-600 text-emerald-700 dark:text-emerald-400" : "ring-zinc-200 dark:ring-zinc-600 text-zinc-500 dark:text-zinc-400"}`}
                      >
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CreateTaskDialog — leader only */}
      {isLeader && showCreateTask && (
        <CreateTaskDialog
          showCreateTask={showCreateTask}
          setShowCreateTask={setShowCreateTask}
          projectId={id}
        />
      )}
    </div>
  );
}
