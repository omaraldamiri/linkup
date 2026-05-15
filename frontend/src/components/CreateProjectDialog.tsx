import { useState } from "react";
import { XIcon } from "lucide-react";
import useWorkspace from "../hooks/useWorkspace";
import useProject from "../hooks/useProject";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

const CreateProjectDialog = ({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}) => {
  const { workspaces } = useAuth();
  const { currentWorkspace, members } = useWorkspace();
  const { createProject } = useProject();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    startDate: "",
    endDate: "",
    addedEmails: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) {
      if (workspaces.length === 0) {
        toast.error("Create a workspace before adding a project.");
      } else {
        toast.error("Select a workspace before creating a project.");
      }
      return;
    }
    setIsSubmitting(true);
    try {
      await createProject({
        name: formData.name,
        workspaceId: currentWorkspace.id,
        description: formData.description || undefined,
        projectPriority: formData.priority,
        startDate: formData.startDate
          ? `${formData.startDate}T00:00:00`
          : undefined,
        endDate: formData.endDate ? `${formData.endDate}T00:00:00` : undefined,
        addedEmails:
          formData.addedEmails.length > 0 ? formData.addedEmails : undefined,
      });
      toast.success(`Project "${formData.name}" created successfully.`);
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        priority: "MEDIUM",
        startDate: "",
        endDate: "",
        addedEmails: [],
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEmail = (email: string) => {
    if (email && !formData.addedEmails.includes(email)) {
      setFormData((prev) => ({
        ...prev,
        addedEmails: [...prev.addedEmails, email],
      }));
    }
  };

  const removeEmail = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      addedEmails: prev.addedEmails.filter((e) => e !== email),
    }));
  };

  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg text-zinc-900 dark:text-zinc-200 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          onClick={() => setIsDialogOpen(false)}
        >
          <XIcon className="size-5" />
        </button>

        <h2 className="text-xl font-medium mb-1">Create New Project</h2>
        {!currentWorkspace ? (
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
            {workspaces.length === 0
              ? "Create a workspace first, then you can add projects."
              : "Select a workspace from the sidebar before creating a project."}
          </p>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            In workspace:{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {currentWorkspace.name}
            </span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm mb-1">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter project name"
              className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your project"
              className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm h-20"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as "LOW" | "MEDIUM" | "HIGH",
                })
              }
              className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                min={formData.startDate || undefined}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm"
              />
            </div>
          </div>

          {/* Add Members */}
          <div>
            <label className="block text-sm mb-1">Add Members (optional)</label>
            <select
              className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm"
              value=""
              onChange={(e) => addEmail(e.target.value)}
            >
              <option value="">Select a workspace member</option>
              {members
                .filter((m) => !formData.addedEmails.includes(m.userDTO.email))
                .map((m) => (
                  <option key={m.userDTO.id} value={m.userDTO.email}>
                    {m.userDTO.email}
                  </option>
                ))}
            </select>

            {formData.addedEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.addedEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-1 bg-blue-200/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md text-sm"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="ml-1 hover:bg-blue-300/30 dark:hover:bg-blue-500/30 rounded"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 text-sm">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentWorkspace}
              className="px-4 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectDialog;
