import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AUTH_NEXT_STORAGE_KEY } from "../utils/safeReturnPath";
import useWorkspace from "../hooks/useWorkspace";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

/**
 * Accepts a workspace invitation after the user follows the email link
 * (?token=...). Must be authenticated as the invited user.
 */
const WorkspaceInviteAccept = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { acceptWorkspaceInvitation } = useWorkspace();
  const { refreshWorkspaces } = useAuth();
  const ran = useRef(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get("token");
    if (!token) {
      toast.error("Missing invitation token.");
      navigate("/team", { replace: true });
      return;
    }

    const run = async () => {
      try {
        const msg = await acceptWorkspaceInvitation(token);
        setMessage(msg);
        toast.success(msg);
        await refreshWorkspaces();
        sessionStorage.removeItem(AUTH_NEXT_STORAGE_KEY);
        navigate("/team", { replace: true });
      } catch (err: unknown) {
        const error = err as { response?: { data?: unknown } };
        const data = error.response?.data;
        const text =
          typeof data === "string" ? data : "Could not accept invitation.";
        toast.error(text);
        navigate("/team", { replace: true });
      }
    };

    void run();
  }, [
    acceptWorkspaceInvitation,
    navigate,
    refreshWorkspaces,
    searchParams,
  ]);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="size-8 text-blue-500 animate-spin" />
      <p className="text-sm text-gray-600 dark:text-zinc-400">
        {message ?? "Accepting workspace invitation…"}
      </p>
    </div>
  );
};

export default WorkspaceInviteAccept;
