/** Prevents open redirects: only same-origin relative paths are allowed. */
export function isSafeInternalReturnPath(
  path: string | null | undefined,
): path is string {
  if (path == null || typeof path !== "string") return false;
  const t = path.trim();
  if (!t.startsWith("/")) return false;
  if (t.startsWith("//")) return false;
  if (/^https?:/i.test(t)) return false;
  return true;
}

/** Persists post-login redirect through Google OAuth (callback has no query string). */
export const AUTH_NEXT_STORAGE_KEY = "authNext";
