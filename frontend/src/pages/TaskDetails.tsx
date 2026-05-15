import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  PenIcon,
  Trash2Icon,
  ArrowLeftIcon,
  MessageCircleIcon,
  SendIcon,
} from "lucide-react";
import useTask from "../hooks/useTask";
import useProject from "../hooks/useProject";
import useComment from "../hooks/useComment";
import useAuth from "../hooks/useAuth";
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (
  dateStr: string | null,
  pattern = "dd MMM yyyy",
): string => {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), pattern);
  } catch {
    return "—";
  }
};

const statusColors: Record<string, string> = {
  TODO: "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300",
  IN_PROGRESS: "bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-300",
  DONE: "bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300",
};

const typeColors: Record<string, string> = {
  TASK: "bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-300",
  BUG: "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-300",
  FEATURE: "bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-300",
  IMPROVEMENT:
    "bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-300",
  OTHER: "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-300",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300",
  MEDIUM: "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-300",
  HIGH: "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-300",
};

// ── Component ─────────────────────────────────────────────────────────────────

const TaskDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const projectId = searchParams.get("projectId");
  const taskId = searchParams.get("taskId");

  const { tasks, tasksLoading, currentTask, selectTask, deleteTask } =
    useTask();
  const { currentProject, currentUserRole, selectProject } = useProject();
  const { comments, commentsLoading, createComment } = useComment();
  const { user } = useAuth();

  const isLeader = currentUserRole === "LEADER";

  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest comment whenever the list grows
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // Ensure the right project and task are selected when arriving via direct URL
  useEffect(() => {
    if (projectId && currentProject?.id !== projectId) {
      selectProject(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (taskId) selectTask(taskId);
  }, [taskId, tasks]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!currentTask) return;

    setDeleting(true);
    try {
      await deleteTask(currentTask.id);
      toast.success("Task deleted");
      setDeleteConfirmOpen(false);
      navigate(`/projectsDetail?id=${currentTask.projectId}&tab=tasks`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete task");
      setDeleting(false);
    }
  };

  const handlePostComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    setPosting(true);
    try {
      await createComment(trimmed);
      setNewComment("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  // Ctrl/Cmd + Enter submits the comment
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handlePostComment();
    }
  };

  // ── Loading / not-found guards ────────────────────────────────────────────

  if (tasksLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (!currentTask || currentTask.id !== taskId) {
    return (
      <div className="p-6 text-center text-zinc-900 dark:text-zinc-200">
        <p className="text-3xl md:text-5xl mt-40 mb-10">Task not found</p>
        <button
          onClick={() =>
            navigate(
              projectId
                ? `/projectsDetail?id=${projectId}&tab=tasks`
                : "/projects",
            )
          }
          className="mt-4 px-4 py-2 rounded bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
        >
          Back to Project
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
    <div className="flex flex-col lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 max-w-6xl mx-auto">
      {/* ── Left: Task Discussion ── */}
      <div className="w-full lg:w-2/3">
        <div className="p-5 rounded-md border border-gray-300 dark:border-zinc-800 flex flex-col lg:h-[80vh]">
          {/* Header */}
          <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white shrink-0">
            <MessageCircleIcon className="size-5" />
            Task Discussion ({comments.length})
          </h2>

          {/* Comment list — scrollable */}
          <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
            {commentsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                  />
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-gray-600 dark:text-zinc-500 text-sm">
                No comments yet. Be the first!
              </p>
            ) : (
              <div className="flex flex-col gap-3 mb-4 pr-1">
                {comments.map((comment, idx) => {
                  const isOwn = comment.userEmail === user?.email;
                  return (
                    <div
                      key={idx}
                      className={`max-w-[85%] dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 p-3 rounded-md ${isOwn ? "ml-auto" : "mr-auto"}`}
                    >
                      {/* Author + timestamp */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-medium shrink-0">
                          {comment.userEmail?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-zinc-200 truncate max-w-[140px]">
                          {comment.userEmail}
                        </span>
                        {comment.createdAt && (
                          <span className="text-xs text-gray-400 dark:text-zinc-600 shrink-0">
                            · {formatDate(comment.createdAt, "dd MMM, HH:mm")}
                          </span>
                        )}
                      </div>
                      {/* Content */}
                      <p className="text-sm text-gray-900 dark:text-zinc-200 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  );
                })}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>

          {/* Input — pinned to bottom */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-3 shrink-0 border-t border-gray-200 dark:border-zinc-800">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment… (Ctrl+Enter to post)"
              rows={3}
              className="w-full dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button
              onClick={handlePostComment}
              disabled={posting || !newComment.trim()}
              className="flex items-center gap-2 bg-gradient-to-l from-blue-500 to-blue-600 text-white text-sm px-5 py-2 rounded disabled:opacity-60 transition-opacity"
            >
              <SendIcon className="size-4" />
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Task info + Project info ── */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        {/* Back button */}
        <button
          onClick={() =>
            navigate(
              projectId
                ? `/projectsDetail?id=${projectId}&tab=tasks`
                : "/projects",
            )
          }
          className="self-start flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back to project
        </button>

        {/* Task card */}
        <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100">
              {currentTask.title}
            </h1>
            {/* Delete — leader only */}
            {isLeader && (
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={deleting}
                title="Delete task"
                className="p-1.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-950 transition-colors disabled:opacity-50 shrink-0"
              >
                <Trash2Icon className="size-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={`px-2 py-0.5 rounded text-xs ${statusColors[currentTask.taskStatus] ?? ""}`}
            >
              {currentTask.taskStatus.replace("_", " ")}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs ${typeColors[currentTask.taskType] ?? ""}`}
            >
              {currentTask.taskType}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs ${priorityColors[currentTask.taskPriority] ?? ""}`}
            >
              {currentTask.taskPriority}
            </span>
          </div>

          {currentTask.description && (
            <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">
              {currentTask.description}
            </p>
          )}

          <hr className="border-zinc-200 dark:border-zinc-700 my-3" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-medium shrink-0">
                {currentTask.assigneeEmail?.[0]?.toUpperCase() ?? "?"}
              </div>
              <span className="truncate text-xs">
                {currentTask.assigneeEmail || "Unassigned"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-gray-500 dark:text-zinc-500 shrink-0" />
              <span>Due: {formatDate(currentTask.dueTime)}</span>
            </div>
          </div>

          {currentTask.createdAt && (
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-4">
              Created {formatDate(currentTask.createdAt, "dd MMM yyyy, HH:mm")}
            </p>
          )}
        </div>

        {/* Project card */}
        {currentProject && (
          <div className="p-4 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-800">
            <p className="text-xl font-medium mb-4">Project Details</p>
            <h2 className="text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <PenIcon className="size-4" />
              {currentProject.name}
            </h2>
            {currentProject.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                {currentProject.description}
              </p>
            )}
            <p className="text-xs mt-3">
              Start: {formatDate(currentProject.startDate)}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-3">
              <span>
                Status: {currentProject.projectStatus.replace("_", " ")}
              </span>
              <span>Priority: {currentProject.projectPriority}</span>
              <span>Progress: {currentProject.progress ?? 0}%</span>
            </div>
          </div>
        )}
      </div>
    </div>

    <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            {currentTask
              ? `"${currentTask.title}" will be permanently removed. This cannot be undone.`
              : "This task will be permanently removed. This cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {deleting ? "Deleting..." : "Delete task"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default TaskDetails;
