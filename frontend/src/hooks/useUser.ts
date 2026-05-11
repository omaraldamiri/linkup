import { useContext } from "react";
import { UserContext, type UserContextValue } from "../contexts/UserContext";

/**
 * Access user mutation actions (update, delete).
 * Kept separate from UserContext.tsx for Vite fast-refresh compatibility —
 * hooks and components must live in separate files.
 *
 * @throws if used outside <UserProvider>
 */
const useUser = (): UserContextValue => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside <UserProvider>");
  }
  return ctx;
};

export default useUser;
