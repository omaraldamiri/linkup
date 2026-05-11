import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../contexts/AuthContext";

/**
 * Access the authenticated user and auth actions.
 *
 * Separated from AuthContext.tsx so that Vite's fast-refresh can work correctly —
 * a file that exports only a hook (non-component) and a file that exports only a
 * component (AuthProvider) must be kept apart.
 *
 * @throws if used outside of <AuthProvider>
 */
const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
};

export default useAuth;
