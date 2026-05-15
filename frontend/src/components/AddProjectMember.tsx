import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import useWorkspace from "../hooks/useWorkspace";
import useProject from "../hooks/useProject";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const AddProjectMember = ({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");

  const { members: workspaceMembers } = useWorkspace();
  const { currentProject, projectMembers, addProjectMember } = useProject();

  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Emails already in the project — used to filter the dropdown
  const projectMemberEmails = new Set(
    projectMembers.map((m) => m.userDTO.email),
  );

  // Workspace members not yet in the project
  const eligibleMembers = workspaceMembers.filter(
    (m) => !projectMemberEmails.has(m.userDTO.email),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !email) return;
    setIsAdding(true);
    try {
      await addProjectMember(projectId, email);
      toast.success("Member added to project");
      setEmail("");
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="size-5" /> Add Member to Project
          </h2>
          {currentProject && (
            <p className="text-sm text-zinc-700 dark:text-zinc-400">
              Adding to:{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {currentProject.name}
              </span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
              <select
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm py-2 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select a workspace member</option>
                {eligibleMembers.map((m) => (
                  <option key={m.userDTO.id} value={m.userDTO.email}>
                    {m.userDTO.email}
                  </option>
                ))}
              </select>
            </div>
            {eligibleMembers.length === 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                All workspace members are already in this project.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !email}
              className="px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white disabled:opacity-50 transition"
            >
              {isAdding ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectMember;
