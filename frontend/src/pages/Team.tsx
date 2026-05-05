import { useState } from "react";
import {
  UsersIcon,
  Search,
  Shield,
  Activity,
  Loader2,
  MoreHorizontal,
  Trash2,
  Crown,
  UserPlus,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useAuth from "../hooks/useAuth";
import useWorkspace from "../hooks/useWorkspace";
import InviteMemberDialog from "../components/InviteMemberDialog";
import CreateWorkspaceDialog from "../components/CreateWorkspaceDialog";
import type { UserRoleDTO, WorkspaceRole } from "../types/workspaceDtos";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Mock until projects/tasks domains are implemented
const MOCK_ACTIVE_PROJECTS = 4;
const MOCK_TOTAL_TASKS = 23;

const RoleBadge = ({ role }: { role: WorkspaceRole }) => {
  const styles: Record<WorkspaceRole, string> = {
    OWNER:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
    MEMBER: "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300",
  };
  return (
    <span
      className={`px-2 py-1 text-xs rounded-md font-medium ${styles[role]}`}
    >
      {role}
    </span>
  );
};

const Team = () => {
  const navigate = useNavigate();
  const { user, workspaces } = useAuth();
  const {
    currentWorkspace,
    members,
    membersLoading,
    removeMember,
    editMemberRole,
    deleteWorkspace,
  } = useWorkspace();

  const [searchTerm, setSearchTerm] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  // Remove member
  const [removeTarget, setRemoveTarget] = useState<UserRoleDTO | null>(null);
  const [removing, setRemoving] = useState(false);

  // Edit role
  const [editTarget, setEditTarget] = useState<UserRoleDTO | null>(null);
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>("MEMBER");
  const [editing, setEditing] = useState(false);

  // Create workspace
  const [showCreate, setShowCreate] = useState(false);

  // Delete workspace
  const [deleteWsOpen, setDeleteWsOpen] = useState(false);
  const [deletingWs, setDeletingWs] = useState(false);

  // Derive current user's role — using userDTO.id from UserRoleDTO
  const myMembership = members.find((m) => m.userDTO.id === user?.id);
  const isOwner = myMembership?.role === "OWNER";

  const filteredMembers = members.filter(
    (m) =>
      m.userDTO.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.userDTO.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRemove = async () => {
    if (!removeTarget || !currentWorkspace) return;
    setRemoving(true);
    try {
      await removeMember(currentWorkspace.id, removeTarget.userDTO.id);
      toast.success(`${removeTarget.userDTO.name} removed from workspace.`);
      setRemoveTarget(null);
    } catch {
      toast.error("Failed to remove member.");
    } finally {
      setRemoving(false);
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !currentWorkspace) return;
    setEditing(true);
    try {
      await editMemberRole({
        userId: editTarget.userDTO.id,
        workSpaceId: currentWorkspace.id,
        newRole: selectedRole,
      });
      toast.success(
        `${editTarget.userDTO.name}'s role updated to ${selectedRole}.`,
      );
      setEditTarget(null);
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace) return;
    setDeletingWs(true);
    try {
      await deleteWorkspace(currentWorkspace.id);
      toast.success("Workspace deleted.");
      navigate("/");
    } catch {
      toast.error("Failed to delete workspace.");
      setDeletingWs(false);
    }
  };

  const openEditRole = (member: UserRoleDTO) => {
    setSelectedRole(member.role);
    setEditTarget(member);
  };

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 max-w-6xl mx-auto">
        <div className="w-24 h-24 mb-6 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
          <UsersIcon className="w-12 h-12 text-gray-400 dark:text-zinc-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No workspace created or entered yet
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6 text-center max-w-md">
          Create a new workspace to start managing projects and collaborating
          with your team.
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white transition"
        >
          <Plus size={16} /> Create Workspace
        </button>
        <CreateWorkspaceDialog open={showCreate} onOpenChange={setShowCreate} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            Team
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">
            Manage team members and their contributions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center px-4 py-2 rounded text-sm bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white transition gap-2"
          >
            <UserPlus className="w-4 h-4" /> Add Member
          </button>
          {/* Delete workspace — owner only */}
          {isOwner && (
            <button
              onClick={() => setDeleteWsOpen(true)}
              className="flex items-center px-4 py-2 rounded text-sm border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete Workspace
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-4">
        <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between gap-8 md:gap-22">
            <div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Total Members
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {membersLoading ? "—" : members.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/10">
              <UsersIcon className="size-4 text-blue-500 dark:text-blue-200" />
            </div>
          </div>
        </div>

        <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between gap-8 md:gap-22">
            <div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Active Projects
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {MOCK_ACTIVE_PROJECTS}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
              <Activity className="size-4 text-emerald-500 dark:text-emerald-200" />
            </div>
          </div>
        </div>

        <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between gap-8 md:gap-22">
            <div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Total Tasks
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {MOCK_TOTAL_TASKS}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/10">
              <Shield className="size-4 text-purple-500 dark:text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-3" />
        <input
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full text-sm rounded-md border border-gray-300 dark:border-zinc-800 bg-white dark:bg-transparent text-gray-900 dark:text-white placeholder-gray-400 py-2 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Members Table */}
      <div className="w-full">
        {membersLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 text-blue-500 animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <UsersIcon className="w-12 h-12 text-gray-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {members.length === 0
                ? "No team members yet"
                : "No members match your search"}
            </h3>
            <p className="text-gray-500 dark:text-zinc-400">
              {members.length === 0
                ? "Add team members to start collaborating"
                : "Try adjusting your search term"}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl w-full">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto rounded-md border border-gray-200 dark:border-zinc-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                <thead className="bg-gray-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-2.5 text-left font-medium text-sm">
                      Name
                    </th>
                    <th className="px-6 py-2.5 text-left font-medium text-sm">
                      Email
                    </th>
                    <th className="px-6 py-2.5 text-left font-medium text-sm">
                      Role
                    </th>
                    {isOwner && (
                      <th className="px-6 py-2.5 text-left font-medium text-sm">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.userDTO.id}
                      className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {member.userDTO.image ? (
                            <img
                              src={member.userDTO.image}
                              alt={member.userDTO.name}
                              className="size-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="size-7 rounded-full bg-[#1a3a2e] flex items-center justify-center text-white text-xs font-bold">
                              {member.userDTO.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-zinc-800 dark:text-white">
                            {member.userDTO.name || "Unknown"}
                            {member.userDTO.id === user?.id && (
                              <span className="ml-1.5 text-xs text-gray-400">
                                (you)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                        {member.userDTO.email}
                      </td>
                      <td className="px-6 py-2.5 whitespace-nowrap">
                        <RoleBadge role={member.role} />
                      </td>
                      {isOwner && (
                        <td className="px-6 py-2.5 whitespace-nowrap">
                          {member.role !== "OWNER" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition">
                                  <MoreHorizontal
                                    size={15}
                                    className="text-gray-500 dark:text-zinc-400"
                                  />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2"
                                  onClick={() => openEditRole(member)}
                                >
                                  <Crown size={13} /> Edit role
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:text-red-600"
                                  onClick={() => setRemoveTarget(member)}
                                >
                                  <Trash2 size={13} /> Remove member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {filteredMembers.map((member) => (
                <div
                  key={member.userDTO.id}
                  className="p-4 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {member.userDTO.image ? (
                        <img
                          src={member.userDTO.image}
                          alt={member.userDTO.name}
                          className="size-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-9 rounded-full bg-[#1a3a2e] flex items-center justify-center text-white font-bold">
                          {member.userDTO.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {member.userDTO.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          {member.userDTO.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={member.role} />
                      {isOwner && member.role !== "OWNER" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition">
                              <MoreHorizontal
                                size={15}
                                className="text-gray-500"
                              />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              className="cursor-pointer gap-2"
                              onClick={() => openEditRole(member)}
                            >
                              <Crown size={13} /> Edit role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                              onClick={() => setRemoveTarget(member)}
                            >
                              <Trash2 size={13} /> Remove member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        isDialogOpen={inviteOpen}
        setIsDialogOpen={setInviteOpen}
      />

      {/* Remove Member Confirmation */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {removeTarget?.userDTO.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access to this workspace and all its projects
              immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {removing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Role Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit role — {editTarget?.userDTO.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditRole} className="space-y-4 pt-1">
            <div className="space-y-2">
              {(["MEMBER", "OWNER"] as WorkspaceRole[]).map((role) => (
                <label
                  key={role}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    selectedRole === role
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={() => setSelectedRole(role)}
                    className="mt-0.5 accent-emerald-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {role}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {role === "MEMBER"
                        ? "Can view and contribute to projects and tasks"
                        : "Full access to manage workspace, members, and settings"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={editing || selectedRole === editTarget?.role}
              className="w-full bg-[#1a3a2e] hover:bg-[#14301f] text-white font-medium py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {editing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Save role"
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Workspace Confirmation */}
      <AlertDialog
        open={deleteWsOpen}
        onOpenChange={(v) => !v && setDeleteWsOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete "{currentWorkspace?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workspace, all its projects,
              tasks, and remove all members. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkspace}
              disabled={deletingWs}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingWs ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Delete Workspace"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Team;
