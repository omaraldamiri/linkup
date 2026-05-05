import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import useWorkspace from "../hooks/useWorkspace";
import { useSearchParams } from "react-router-dom";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {

    const [searchParams] = useSearchParams();

    const id = searchParams.get('id');

    const { currentWorkspace } = useWorkspace();

    // TODO: replace with real API call when projects/tasks domain is implemented
    const MOCK_PROJECTS = [
      { id: "1", name: "Website Redesign", status: "IN_PROGRESS", description: "Redesign the company website", createdAt: "2026-01-15" },
      { id: "2", name: "Mobile App", status: "TODO", description: "Build the mobile application", createdAt: "2026-02-01" },
      { id: "3", name: "API Integration", status: "COMPLETED", description: "Integrate third-party APIs", createdAt: "2026-01-20" },
      { id: "4", name: "Database Migration", status: "IN_PROGRESS", description: "Migrate to new database schema", createdAt: "2026-03-01" },
    ]

    const project = MOCK_PROJECTS.find((p) => p.id === id);
    const projectMembersEmails = project ? [] : [];

    const [email, setEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5 text-zinc-900 dark:text-zinc-200" /> Add Member to Project
                    </h2>
                    {currentWorkspace && (
                        <p className="text-sm text-zinc-700 dark:text-zinc-400">
                            Adding to Project: <span className="text-blue-600 dark:text-blue-400">{project.name}</span>
                        </p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
                            {/* List All non project members from current workspace */}
                            <select value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 py-2 focus:outline-none focus:border-blue-500" required >
                                <option value="">Select a member</option>
                                {currentWorkspace?.members
                                    .filter((member) => !projectMembersEmails.includes(member.user.email))
                                    .map((member) => (
                                        <option key={member.user.id} value={member.user.email}> {member.user.email} </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition" >
                            Cancel
                        </button>
                        <button type="submit" disabled={isAdding || !currentWorkspace} className="px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white disabled:opacity-50 transition" >
                            {isAdding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectMember;
