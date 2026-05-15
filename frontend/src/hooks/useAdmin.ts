import { useContext } from "react";
import { AdminContext } from "../contexts/AdminContext";

const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return ctx;
};

export default useAdmin;
