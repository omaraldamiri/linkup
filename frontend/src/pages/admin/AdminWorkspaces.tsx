import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import useAdmin from "../../hooks/useAdmin";
import type { AdminWorkspaceRowDTO } from "../../types/adminDtos";
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

const AdminWorkspaces = () => {
  const { workspaces, workspacesLoading, fetchWorkspaces, deleteWorkspace } =
    useAdmin();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] =
    useState<AdminWorkspaceRowDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkspaces(search, page);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page, fetchWorkspaces]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteWorkspace(deleteTarget.id);
      toast.success("Workspace deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete workspace");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = workspaces?.totalPages ?? 0;

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Workspaces
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Platform-wide workspace oversight
        </p>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name or slug..."
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
                Workspace
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300 hidden md:table-cell">
                Owner
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300">
                Members
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300 hidden sm:table-cell">
                Created
              </th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {workspacesLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                  <Loader2 className="size-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : workspaces?.content.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                  No workspaces found
                </td>
              </tr>
            ) : (
              workspaces?.content.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {row.name}
                    </p>
                    <p className="text-zinc-500 text-xs">{row.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                    {row.ownerEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {row.memberCount}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">
                    {row.createdAt
                      ? format(new Date(row.createdAt), "MMM d, yyyy")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          disabled={deleting}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 text-red-600 dark:text-red-400"
                          onClick={() => setDeleteTarget(row)}
                        >
                          <Trash2 size={14} /> Delete workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            Page {page + 1} of {totalPages} ({workspaces?.totalElements ?? 0}{" "}
            workspaces)
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
            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {deleteTarget?.name} and all projects,
              tasks, and members inside it.
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

export default AdminWorkspaces;
