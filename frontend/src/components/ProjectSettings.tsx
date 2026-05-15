import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Shield } from "lucide-react";
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
import AddProjectMember from "./AddProjectMember";
import useProject from "../hooks/useProject";
import { toast } from "sonner";
import type { ProjectRole } from "../types/projectDtos";

// Helper: extract "YYYY-MM-DD" from any ISO datetime string
const toDateInput = (dateStr: string | null): string => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

export default function ProjectSettings() {
  const {
    currentProject,
    projectMembers,
    membersLoading,
    editProject,
    deleteProject,
    removeProjectMember,
    editProjectMemberRole,
  } = useProject();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "PLANNING" as string,
    priority: "MEDIUM" as string,
    startDate: "",
    endDate: "",
    progress: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Sync form whenever currentProject changes
  useEffect(() => {
    if (!currentProject) return;
    setFormData({
      name: currentProject.name,
      description: currentProject.description ?? "",
      status: currentProject.projectStatus,
      priority: currentProject.projectPriority,
      startDate: toDateInput(currentProject.startDate),
      endDate: toDateInput(currentProject.endDate),
      progress: currentProject.progress ?? 0,
    });
  }, [currentProject]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    setIsSubmitting(true);
    try {
      await editProject(currentProject.id, {
        name: formData.name,
        description: formData.description || undefined,
        projectPriority: formData.priority as any,
        projectStatus: formData.status as any,
        startDate: formData.startDate
          ? `${formData.startDate}T00:00:00`
          : undefined,
        endDate: formData.endDate ? `${formData.endDate}T00:00:00` : undefined,
        progress: formData.progress,
      });
      toast.success("Project saved");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;
    setDeletingProject(true);
    try {
      await deleteProject(currentProject.id);
      toast.success(`"${currentProject.name}" deleted`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete project");
    } finally {
      setDeletingProject(false);
      setDeleteProjectOpen(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentProject) return;
    setRemovingMemberId(userId);
    try {
      await removeProjectMember(currentProject.id, userId);
      toast.success("Member removed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: ProjectRole) => {
    if (!currentProject) return;
    setEditingRoleId(userId);
    try {
      await editProjectMemberRole({
        userId,
        projectId: currentProject.id,
        newRole,
      });
      toast.success("Role updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update role");
    } finally {
      setEditingRoleId(null);
    }
  };

  const inputClasses =
    "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300";
  const cardClasses =
    "rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800";
  const labelClasses = "text-sm text-zinc-600 dark:text-zinc-400";

  if (!currentProject) return null;

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Project Details form */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300">
              Project Details
            </h2>
            <button
              type="button"
              onClick={() => setDeleteProjectOpen(true)}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 px-3 py-1.5 rounded border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
            >
              <Trash2 className="size-3.5" />
              Delete Project
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className={labelClasses}>Project Name</label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={inputClasses}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={inputClasses + " h-24"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClasses}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className={inputClasses}
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={labelClasses}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className={inputClasses}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClasses}>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate || undefined}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>
                Progress: {formData.progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.progress}
                onChange={(e) =>
                  setFormData({ ...formData, progress: Number(e.target.value) })
                }
                className="w-full accent-blue-500 dark:accent-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto flex items-center text-sm justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              <Save className="size-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Team Members */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300">
              Team Members{" "}
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                ({projectMembers.length})
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setAddMemberOpen(true)}
              className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Plus className="size-4 text-zinc-900 dark:text-zinc-300" />
            </button>
          </div>

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
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No members yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {projectMembers.map((member) => {
                const isLeaderMember = member.role === "LEADER";
                const isBeingRemoved = removingMemberId === member.userDTO.id;
                const isEditingRole = editingRoleId === member.userDTO.id;

                return (
                  <div
                    key={member.userDTO.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-300"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {member.userDTO.image ? (
                        <img
                          src={member.userDTO.image}
                          alt={member.userDTO.name}
                          className="size-6 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="size-6 rounded-full bg-zinc-600 flex-shrink-0 flex items-center justify-center text-xs text-white">
                          {member.userDTO.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="truncate">{member.userDTO.email}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isLeaderMember ? (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded ring ring-zinc-200 dark:ring-zinc-600 text-zinc-600 dark:text-zinc-400">
                          <Shield className="size-3" />
                          Leader
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          disabled={isEditingRole}
                          onChange={(e) =>
                            handleRoleChange(
                              member.userDTO.id,
                              e.target.value as ProjectRole,
                            )
                          }
                          className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-50"
                        >
                          <option value="VIEWER">Viewer</option>
                          <option value="LEADER">Leader</option>
                        </select>
                      )}

                      {/* Cannot remove the leader */}
                      {!isLeaderMember && (
                        <button
                          onClick={() => handleRemoveMember(member.userDTO.id)}
                          disabled={isBeingRemoved}
                          className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition"
                          title="Remove member"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddProjectMember
        isDialogOpen={addMemberOpen}
        setIsDialogOpen={setAddMemberOpen}
      />

      {/* Confirm delete project */}
      <AlertDialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{currentProject.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all its tasks. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingProject}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deletingProject}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deletingProject ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
