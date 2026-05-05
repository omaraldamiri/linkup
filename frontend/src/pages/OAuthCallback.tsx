import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import type { AuthResponse } from "../types/authDtos";
import toast from "react-hot-toast";

/**
 * Landing page for Google OAuth2 redirect.
 *
 * Spring's OAuth2SuccessHandler redirects here with a base64-encoded AuthResponse
 * in the ?data= query param. image and imageUrl fields are intentionally null in
 * that payload (stripped to keep the redirect URL under nginx's header buffer limit).
 *
 * After applying the token we fire two parallel re-fetches:
 *   - GET /users/me       → populates user.image
 *   - GET /workspaces/my  → populates workspace.imageUrl for every workspace
 *
 * Both are fire-and-forget. The user is authenticated and navigated to "/" regardless.
 * If either call fails, images just won't render until the next page load.
 */
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback, refreshUser, refreshWorkspaces } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const data = searchParams.get("data");

    if (!data) {
      toast.error("OAuth login failed — no data received.");
      navigate("/auth", { replace: true });
      return;
    }

    try {
      const decoded = atob(data);
      const authResponse: AuthResponse = JSON.parse(decoded);
      const { token, userDTO, workspaceDTOList } = authResponse;

      // Apply token + minimal user/workspace data immediately — app is authenticated
      handleOAuthCallback(token, userDTO, workspaceDTOList);

      // Re-hydrate image fields in parallel — stripped from redirect to avoid
      // exceeding nginx's large_client_header_buffers limit (default 4×8KB)
      Promise.all([refreshUser(), refreshWorkspaces()]).catch(() => {});

      navigate("/", { replace: true });
    } catch {
      toast.error("OAuth login failed — could not parse response.");
      navigate("/auth", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-950">
      <span className="size-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default OAuthCallback;
