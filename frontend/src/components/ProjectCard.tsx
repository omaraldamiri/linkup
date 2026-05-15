import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
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
import useProject from "../hooks/useProject";
import { toast } from "sonner";
import type { ProjectDTO } from "../types/projectDtos";

const statusColors: Record<string, string> = {
  PLANNING: "bg-gray-200 dark:bg-zinc-600 text-gray-900 dark:text-zinc-200",
  ACTIVE: "bg-emerald-200 dark:bg-emerald-500 text-emerald-900",
  ON_HOLD: "bg-amber-200 dark:bg-amber-500 text-amber-900",
  COMPLETED: "bg-blue-200 dark:bg-blue-500 text-blue-900",
  CANCELLED: "bg-red-200 dark:bg-red-500 text-red-900",
};

const ProjectCard = ({ project }: { project: ProjectDTO }) => {
  const { deleteProject } = useProject();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isLeader = project.currentUserRole === "LEADER";

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(project.id);
      toast.success(`"${project.name}" deleted`);
      navigate("/projects");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <Link
          to={`/projectsDetail?id=${project.id}&tab=tasks`}
          className="block bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg p-5 transition-all duration-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-semibold text-gray-900 dark:text-zinc-200 mb-1 truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
              <p className="text-gray-500 dark:text-zinc-400 text-sm line-clamp-2 mb-3">
                {project.description || "No description"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span
              className={`px-2 py-0.5 rounded text-xs ${statusColors[project.projectStatus] ?? ""}`}
            >
              {project.projectStatus.replace("_", " ")}
            </span>
            <span className="text-xs text-gray-500 dark:text-zinc-500 capitalize">
              {project.projectPriority?.toLowerCase()} priority
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-zinc-500">Progress</span>
              <span className="text-gray-400 dark:text-zinc-400">
                {project.progress ?? 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded">
              <div
                className="h-1.5 rounded bg-blue-500"
                style={{ width: `${project.progress ?? 0}%` }}
              />
            </div>
          </div>
        </Link>

        {/* Delete button — leaders only, shown on hover */}
        {isLeader && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
            className="absolute top-3 right-3 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            title="Delete project"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      {/* Confirm delete dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{project.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all its tasks. This
              action cannot be undone.
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

export default ProjectCard;
