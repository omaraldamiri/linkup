import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import useTask from "../hooks/useTask";
import useProject from "../hooks/useProject";
import type { TaskPriority, TaskType } from "../types/taskDtos";

interface CreateTaskDialogProps {
  showCreateTask: boolean;
  setShowCreateTask: (v: boolean) => void;
  projectId: string | null;
}

interface FormData {
  title: string;
  description: string;
  taskType: TaskType;
  taskPriority: TaskPriority;
  assigneeEmail: string;
  dueDate: string; // local "YYYY-MM-DD" — converted to ISO datetime on submit
}

export default function CreateTaskDialog({
  showCreateTask,
  setShowCreateTask,
  projectId,
}: CreateTaskDialogProps) {
  const { createTask } = useTask();
  // projectMembers gives us the real member list for the assignee dropdown
  const { projectMembers } = useProject();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    taskType: "TASK",
    taskPriority: "MEDIUM",
    assigneeEmail: projectMembers[0]?.userDTO.email ?? "",
    dueDate: "",
  });

  if (!showCreateTask) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) {
      toast.error("No project selected.");
      return;
    }
    if (!formData.assigneeEmail) {
      toast.error("Select an assignee.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask(projectId, {
        title: formData.title,
        description: formData.description || undefined,
        taskType: formData.taskType,
        taskPriority: formData.taskPriority,
        assigneeEmail: formData.assigneeEmail,
        // Backend expects LocalDateTime — append time so Jackson can parse it
        dueTime: formData.dueDate ? `${formData.dueDate}T00:00:00` : undefined,
      });
      toast.success("Task created");
      setShowCreateTask(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-lg w-full max-w-md p-6 text-zinc-900 dark:text-white">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Task title"
              className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the task"
              className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Type</label>
              <select
                value={formData.taskType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taskType: e.target.value as TaskType,
                  })
                }
                className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
                <option value="IMPROVEMENT">Improvement</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={formData.taskPriority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taskPriority: e.target.value as TaskPriority,
                  })
                }
                className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Assignee — real project members from context */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Assignee</label>
            <select
              value={formData.assigneeEmail}
              onChange={(e) =>
                setFormData({ ...formData, assigneeEmail: e.target.value })
              }
              className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1"
              required
            >
              <option value="" disabled>
                Select a member
              </option>
              {projectMembers.map((m) => (
                <option key={m.userDTO.id} value={m.userDTO.email}>
                  {m.userDTO.email}
                  {m.userDTO.name ? ` — ${m.userDTO.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Due Date</label>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1"
              />
            </div>
            {formData.dueDate && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {format(new Date(formData.dueDate), "PPP")}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateTask(false)}
              className="rounded border border-zinc-300 dark:border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded px-5 py-2 text-sm bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white transition disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
