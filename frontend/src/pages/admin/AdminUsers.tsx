import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, Loader2, MoreHorizontal, Trash2, Ban, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import useAdmin from "../../hooks/useAdmin";
import useAuth from "../../hooks/useAuth";
import type { AdminUserRowDTO } from "../../types/adminDtos";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const { users, usersLoading, fetchUsers, setUserEnabled, deleteUser } =
    useAdmin();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRowDTO | null>(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search, page);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page, fetchUsers]);

  const handleToggleEnabled = async (row: AdminUserRowDTO) => {
    setActing(true);
    try {
      await setUserEnabled(row.id, !row.enabled);
      toast.success(row.enabled ? "User disabled" : "User enabled");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : ((err as { response?: { data?: string } })?.response?.data ??
            "Action failed");
      toast.error(typeof msg === "string" ? msg : "Action failed");
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActing(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success("User deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : ((err as { response?: { data?: string } })?.response?.data ??
            "Delete failed");
      toast.error(typeof msg === "string" ? msg : "Delete failed");
    } finally {
      setActing(false);
    }
  };

  const totalPages = users?.totalPages ?? 0;

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Users
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage platform accounts
        </p>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
        />
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300">
                User
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300 hidden sm:table-cell">
                Joined
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300">
                Auth
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300">
                Status
              </th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {usersLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                  <Loader2 className="size-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : users?.content.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                  No users found
                </td>
              </tr>
            ) : (
              users?.content.map((row) => {
                const isSelf = row.id === currentUser?.id;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {row.name}
                        {row.systemAdmin && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-zinc-500 text-xs">{row.email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">
                      {row.createdAt
                        ? format(new Date(row.createdAt), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {row.oAuth2User ? "Google" : "Email"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                          row.enabled
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400"
                        }`}
                      >
                        {row.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!isSelf && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              disabled={acting}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer gap-2"
                              onClick={() => handleToggleEnabled(row)}
                            >
                              {row.enabled ? (
                                <>
                                  <Ban size={14} /> Disable account
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={14} /> Enable account
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-red-600 dark:text-red-400"
                              onClick={() => setDeleteTarget(row)}
                            >
                              <Trash2 size={14} /> Delete user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            Page {page + 1} of {totalPages} ({users?.totalElements ?? 0} users)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {deleteTarget?.email} and all associated
              data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
