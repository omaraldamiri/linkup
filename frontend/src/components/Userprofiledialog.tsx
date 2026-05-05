import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useUser from "../hooks/useUser";
import type { UpdatedUserDTO } from "../types/userDtos";
import toast from "react-hot-toast";
import { compressImage } from "../utils/imageUtils";
import { Loader2, Pencil, Trash2, Upload, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileDialog({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  // ✅ All mutations go through context — never call services directly from here
  const { updateUser, deleteUser, saving, deleting } = useUser();

  const [form, setForm] = useState<UpdatedUserDTO>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    image: user?.image ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setForm((prev) => ({ ...prev, image: compressed }));
    } catch {
      toast.error("Failed to process image. Please try a different file.");
    }
  };

  const handleUpdate = async () => {
    // Build diff — only send changed fields
    const payload: UpdatedUserDTO = {};
    if (form.name && form.name !== user?.name) payload.name = form.name;
    if (form.email && form.email !== user?.email) payload.email = form.email;
    if (form.password) payload.password = form.password;
    if (form.image && form.image !== user?.image) payload.image = form.image;

    if (Object.keys(payload).length === 0) {
      toast("No changes to save.");
      return;
    }

    try {
      await updateUser(payload);
      toast.success("Profile updated.");
      onClose();
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser();
      navigate("/auth");
      toast.success("Account deleted.");
    } catch {
      toast.error("Failed to delete account.");
    }
  };

  const getInitial = () => user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="view">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="view" className="flex-1">
              Profile
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex-1">
              Edit
            </TabsTrigger>
          </TabsList>

          {/* ── View Tab ────────────────────────────────────────────── */}
          <TabsContent value="view" className="space-y-4">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-zinc-800">
              <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 w-28 shrink-0">
                Profile
              </div>
              <div className="flex items-center gap-3 flex-1">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-[#1a3a2e] flex items-center justify-center text-white font-bold">
                    {getInitial()}
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 py-2 border-b border-gray-100 dark:border-zinc-800">
              <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 w-28 shrink-0 mt-0.5">
                Email address
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-800 dark:text-zinc-200">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Member since */}
            <div className="flex items-center gap-4 py-2">
              <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 w-28 shrink-0">
                Member since
              </div>
              <span className="text-sm text-gray-800 dark:text-zinc-200">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>

            {/* Danger zone */}
            <div className="pt-4 border-t border-red-100 dark:border-red-950">
              <p className="text-xs font-medium text-red-500 mb-3">
                Danger zone
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline">
                    <Trash2 size={14} />
                    Delete account
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This is permanent. All your data, projects, and workspaces
                      will be deleted. There is no undo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deleting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Yes, delete my account"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>

          {/* ── Edit Tab ────────────────────────────────────────────── */}
          <TabsContent value="edit" className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                New Password{" "}
                <span className="text-gray-400 dark:text-zinc-500 font-normal">
                  (leave blank to keep current)
                </span>
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                Profile Image
              </label>
              <div className="flex items-center gap-3">
                {form.image ? (
                  <div className="relative">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border border-gray-300 dark:border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, image: "" }))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm text-gray-600 dark:text-zinc-400 transition">
                    <Upload size={14} />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full bg-[#1a3a2e] hover:bg-[#14301f] text-white font-medium py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Pencil size={14} />
                  Save changes
                </>
              )}
            </button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
