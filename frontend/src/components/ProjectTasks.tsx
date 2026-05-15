import { format } from "date-fns";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bug,
  CalendarIcon,
  GitCommit,
  MessageSquare,
  Square,
  Trash,
  XIcon,
  Zap,
} from "lucide-react";
import useTask from "../hooks/useTask";
import useProject from "../hooks/useProject";
import type { TaskStatus } from "../types/taskDtos";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ── Visual maps ───────────────────────────────────────────────────────────────

const typeIcons = {
  BUG: { icon: Bug, color: "text-red-600 dark:text-red-400" },
  FEATURE: { icon: Zap, color: "text-blue-600 dark:text-blue-400" },
  TASK: { icon: Square, color: "text-green-600 dark:text-green-400" },
  IMPROVEMENT: {
    icon: GitCommit,
    color: "text-purple-600 dark:text-purple-400",
  },
  OTHER: { icon: MessageSquare, color: "text-amber-600 dark:text-amber-400" },
};

const priorityStyles = {
  LOW: {
    background: "bg-red-100 dark:bg-red-950",
    prioritycolor: "text-red-600 dark:text-red-400",
  },
  MEDIUM: {
    background: "bg-blue-100 dark:bg-blue-950",
    prioritycolor: "text-blue-600 dark:text-blue-400",
  },
  HIGH: {
    background: "bg-emerald-100 dark:bg-emerald-950",
    prioritycolor: "text-emerald-600 dark:text-emerald-400",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDueDate = (dateStr: string | null): string => {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "dd MMMM");
  } catch {
    return "—";
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

const ProjectTasks = () => {
  const navigate = useNavigate();

  // Task state and actions come entirely from context — no local copy
  const { tasks, tasksLoading, updateTaskStatus, deleteTask, changeAssignee } =
    useTask();

  // Role and member list — needed for leader-gated UI
  const { currentUserRole, projectMembers } = useProject();
  const isLeader = currentUserRole === "LEADER";

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    priority: "",
    assignee: "",
  });

  // Derive unique assignee emails for the filter dropdown
  const assigneeList = useMemo(
    () =>
      Array.from(
        new Set(tasks.map((t) => t.assigneeEmail).filter(Boolean)),
      ) as string[],
    [tasks],
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const { status, type, priority, assignee } = filters;
        return (
          (!status || task.taskStatus === status) &&
          (!type || task.taskType === type) &&
          (!priority || task.taskPriority === priority) &&
          (!assignee || task.assigneeEmail === assignee)
        );
      }),
    [filters, tasks],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update status");
    }
  };

  /**
   * Deletes all selected tasks sequentially.
   * Leader-only — the button that triggers this is hidden for viewers.
   */
  const handleDelete = async () => {
    if (selectedTasks.length === 0) return;
    const count = selectedTasks.length;
    setDeleting(true);
    const toastId = toast.loading(`Deleting ${count} task(s)…`);
    try {
      await Promise.all(selectedTasks.map((id) => deleteTask(id)));
      setSelectedTasks([]);
      setDeleteConfirmOpen(false);
      toast.success(`${count} task(s) deleted`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete tasks", {
        id: toastId,
      });
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Changes the assignee of a single task.
   * Leader-only — the dropdown that triggers this is hidden for viewers.
   */
  const handleChangeAssignee = async (taskId: string, email: string) => {
    try {
      await changeAssignee(taskId, email);
      toast.success("Assignee updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to change assignee");
    }
  };

  // Column count drives the colSpan on the empty-state row
  // Leaders have an extra checkbox column
  const colCount = isLeader ? 7 : 6;

  // ── Loading skeleton ────────────────────────────────────────────────────────

  if (tasksLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div>
        {/* Filters + action buttons */}
        <div className="flex flex-wrap gap-4 mb-4">
          {(["status", "type", "priority", "assignee"] as const).map((name) => {
            const options: Record<string, { label: string; value: string }[]> =
              {
                status: [
                  { label: "All Statuses", value: "" },
                  { label: "To Do", value: "TODO" },
                  { label: "In Progress", value: "IN_PROGRESS" },
                  { label: "Done", value: "DONE" },
                ],
                type: [
                  { label: "All Types", value: "" },
                  { label: "Task", value: "TASK" },
                  { label: "Bug", value: "BUG" },
                  { label: "Feature", value: "FEATURE" },
                  { label: "Improvement", value: "IMPROVEMENT" },
                  { label: "Other", value: "OTHER" },
                ],
                priority: [
                  { label: "All Priorities", value: "" },
                  { label: "Low", value: "LOW" },
                  { label: "Medium", value: "MEDIUM" },
                  { label: "High", value: "HIGH" },
                ],
                assignee: [
                  { label: "All Assignees", value: "" },
                  ...assigneeList.map((email) => ({
                    label: email,
                    value: email,
                  })),
                ],
              };
            return (
              <select
                key={name}
                name={name}
                onChange={handleFilterChange}
                className="border not-dark:bg-white border-zinc-300 dark:border-zinc-800 outline-none px-3 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200"
              >
                {options[name].map((opt, idx) => (
                  <option key={idx} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          })}

          {/* Reset filters */}
          {(filters.status ||
            filters.type ||
            filters.priority ||
            filters.assignee) && (
            <button
              type="button"
              onClick={() =>
                setFilters({ status: "", type: "", priority: "", assignee: "" })
              }
              className="px-3 py-1 flex items-center gap-2 rounded bg-gradient-to-br from-purple-400 to-purple-500 text-zinc-100 dark:text-zinc-200 text-sm transition-colors"
            >
              <XIcon className="size-3" /> Reset
            </button>
          )}

          {/* Bulk delete — leader only */}
          {isLeader && selectedTasks.length > 0 && (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-3 py-1 flex items-center gap-2 rounded bg-gradient-to-br from-red-500 to-red-600 text-white text-sm transition-colors"
            >
              <Trash className="size-3" /> Delete ({selectedTasks.length})
            </button>
          )}
        </div>

        {/* Tasks table */}
        <div className="overflow-auto rounded-lg lg:border border-zinc-300 dark:border-zinc-800">
          <div className="w-full">
            {/* ── Desktop table ── */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full text-sm text-left not-dark:bg-white text-zinc-900 dark:text-zinc-300">
                <thead className="text-xs uppercase dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400">
                  <tr>
                    {/* Checkbox column — leader only */}
                    {isLeader && (
                      <th className="pl-2 pr-1">
                        <input
                          type="checkbox"
                          className="size-3 accent-zinc-600 dark:accent-zinc-500"
                          checked={
                            tasks.length > 0 &&
                            selectedTasks.length === tasks.length
                          }
                          onChange={() =>
                            selectedTasks.length === tasks.length
                              ? setSelectedTasks([])
                              : setSelectedTasks(tasks.map((t) => t.id))
                          }
                        />
                      </th>
                    )}
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Due Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => {
                      const { icon: Icon, color } =
                        typeIcons[task.taskType] ?? {};
                      const { background, prioritycolor } =
                        priorityStyles[task.taskPriority] ?? {};

                      return (
                        <tr
                          key={task.id}
                          onClick={() =>
                            navigate(
                              `/taskDetails?projectId=${task.projectId}&taskId=${task.id}`,
                            )
                          }
                          className="border-t border-zinc-300 dark:border-zinc-800 group hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                        >
                          {/* Checkbox — leader only */}
                          {isLeader && (
                            <td
                              onClick={(e) => e.stopPropagation()}
                              className="pl-2 pr-1"
                            >
                              <input
                                type="checkbox"
                                className="size-3 accent-zinc-600 dark:accent-zinc-500"
                                checked={selectedTasks.includes(task.id)}
                                onChange={() =>
                                  selectedTasks.includes(task.id)
                                    ? setSelectedTasks(
                                        selectedTasks.filter(
                                          (i) => i !== task.id,
                                        ),
                                      )
                                    : setSelectedTasks((prev) => [
                                        ...prev,
                                        task.id,
                                      ])
                                }
                              />
                            </td>
                          )}

                          <td className="px-4 pl-0 py-2">{task.title}</td>

                          {/* Type */}
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              {Icon && <Icon className={`size-4 ${color}`} />}
                              <span className={`uppercase text-xs ${color}`}>
                                {task.taskType}
                              </span>
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="px-4 py-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${background} ${prioritycolor}`}
                            >
                              {task.taskPriority}
                            </span>
                          </td>

                          {/* Status — editable by everyone */}
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2"
                          >
                            <select
                              name="status"
                              value={task.taskStatus}
                              onChange={(e) =>
                                handleStatusChange(
                                  task.id,
                                  e.target.value as TaskStatus,
                                )
                              }
                              className="group-hover:ring ring-zinc-100 outline-none px-2 pr-4 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200 cursor-pointer dark:bg-transparent"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="DONE">Done</option>
                            </select>
                          </td>

                          {/* Assignee — dropdown for leader, static for viewer */}
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2"
                          >
                            {isLeader ? (
                              <select
                                value={task.assigneeEmail}
                                onChange={(e) =>
                                  handleChangeAssignee(task.id, e.target.value)
                                }
                                className="outline-none px-2 py-1 rounded text-xs text-zinc-900 dark:text-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer max-w-[160px] truncate"
                              >
                                {projectMembers.map((m) => (
                                  <option
                                    key={m.userDTO.id}
                                    value={m.userDTO.email}
                                  >
                                    {m.userDTO.email}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                {task.assigneeEmail || "—"}
                              </span>
                            )}
                          </td>

                          {/* Due date */}
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                              <CalendarIcon className="size-4" />
                              {formatDueDate(task.dueTime)}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={colCount}
                        className="text-center text-zinc-500 dark:text-zinc-400 py-6"
                      >
                        {tasks.length === 0
                          ? "No tasks yet. Create one with the New Task button."
                          : "No tasks match the selected filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card view ── */}
            <div className="lg:hidden flex flex-col gap-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const { icon: Icon, color } = typeIcons[task.taskType] ?? {};
                  const { background, prioritycolor } =
                    priorityStyles[task.taskPriority] ?? {};

                  return (
                    <div
                      key={task.id}
                      onClick={() =>
                        navigate(
                          `/taskDetails?projectId=${task.projectId}&taskId=${task.id}`,
                        )
                      }
                      className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4 flex flex-col gap-2 cursor-pointer"
                    >
                      {/* Title + checkbox */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-zinc-900 dark:text-zinc-200 text-sm font-semibold">
                          {task.title}
                        </h3>
                        {isLeader && (
                          <input
                            type="checkbox"
                            className="size-4 accent-zinc-600 dark:accent-zinc-500"
                            checked={selectedTasks.includes(task.id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() =>
                              selectedTasks.includes(task.id)
                                ? setSelectedTasks(
                                    selectedTasks.filter((i) => i !== task.id),
                                  )
                                : setSelectedTasks((prev) => [...prev, task.id])
                            }
                          />
                        )}
                      </div>

                      {/* Type */}
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                        {Icon && <Icon className={`size-4 ${color}`} />}
                        <span className={`${color} uppercase`}>
                          {task.taskType}
                        </span>
                      </div>

                      {/* Priority */}
                      <div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${background} ${prioritycolor}`}
                        >
                          {task.taskPriority}
                        </span>
                      </div>

                      {/* Status */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <label className="text-zinc-600 dark:text-zinc-400 text-xs">
                          Status
                        </label>
                        <select
                          name="status"
                          value={task.taskStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              task.id,
                              e.target.value as TaskStatus,
                            )
                          }
                          className="w-full mt-1 bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-300 dark:ring-zinc-700 outline-none px-2 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </div>

                      {/* Assignee */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <label className="text-zinc-600 dark:text-zinc-400 text-xs">
                          Assignee
                        </label>
                        {isLeader ? (
                          <select
                            value={task.assigneeEmail}
                            onChange={(e) =>
                              handleChangeAssignee(task.id, e.target.value)
                            }
                            className="w-full mt-1 bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-300 dark:ring-zinc-700 outline-none px-2 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200"
                          >
                            {projectMembers.map((m) => (
                              <option
                                key={m.userDTO.id}
                                value={m.userDTO.email}
                              >
                                {m.userDTO.email}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                            {task.assigneeEmail || "—"}
                          </p>
                        )}
                      </div>

                      {/* Due date */}
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <CalendarIcon className="size-4" />
                        {formatDueDate(task.dueTime)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">
                  {tasks.length === 0
                    ? "No tasks yet."
                    : "No tasks match the selected filters."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedTasks.length} task
              {selectedTasks.length === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The selected task{selectedTasks.length === 1 ? "" : "s"} will be
              permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectTasks;
