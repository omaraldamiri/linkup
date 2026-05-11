import { useState } from "react";
import { Mail, UserPlus, Loader2 } from "lucide-react";
import useWorkspace from "../hooks/useWorkspace";
import type { WorkspaceRole } from "../types/workspaceDtos";
import toast from "react-hot-toast";

interface Props {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }: Props) => {
  const { currentWorkspace, inviteMember } = useWorkspace();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "MEMBER" as WorkspaceRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;

    setIsSubmitting(true);
    try {
      await inviteMember({
        userEmail: formData.email,
        workSpaceId: currentWorkspace.id,
        workSpaceRole: formData.role,
      });
      toast.success(`${formData.email} added to workspace.`);
      setFormData({ email: "", role: "MEMBER" });
      setIsDialogOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown } };
      const msg = error.response?.data;
      toast.error(typeof msg === "string" ? msg : "Failed to add member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="size-5" /> Add Team Member
          </h2>
          {currentWorkspace && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Adding to:{" "}
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {currentWorkspace.name}
              </span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="member@example.com"
                required
                className="pl-10 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-sm py-2 focus:outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200 block mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as WorkspaceRole,
                })
              }
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 py-2 px-3 focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="MEMBER">Member</option>
              <option value="OWNER">Owner</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-5 py-2 rounded text-sm border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentWorkspace}
              className="px-5 py-2 rounded text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white disabled:opacity-50 hover:opacity-90 transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Adding...
                </>
              ) : (
                "Add Member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberDialog;
