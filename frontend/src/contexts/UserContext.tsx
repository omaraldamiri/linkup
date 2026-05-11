import { createContext, useState } from "react";
import type { ReactNode } from "react";
import type { UserDTO, UpdatedUserDTO } from "../types/userDtos";
import * as userService from "../services/userService";

export interface UserContextValue {
  updateUser: (data: UpdatedUserDTO) => Promise<void>;
  deleteUser: () => Promise<void>;
  saving: boolean;
  deleting: boolean;
}

const defaultValue: UserContextValue = {
  updateUser: async () => {},
  deleteUser: async () => {},
  saving: false,
  deleting: false,
};

export const UserContext = createContext<UserContextValue>(defaultValue);

const UserProvider = ({
  children,
  onUserChange,
  onUserDelete,
}: {
  children: ReactNode;
  onUserChange: (updated: Partial<UserDTO>) => void;
  onUserDelete: () => void;
}) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateUser = async (data: UpdatedUserDTO): Promise<void> => {
    setSaving(true);
    try {
      await userService.updateMe(data);
      // Propagate changes up to AuthContext so the rest of the app stays in sync.
      // We cast because UpdatedUserDTO is a subset of UserDTO fields.
      onUserChange(data as Partial<UserDTO>);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (): Promise<void> => {
    setDeleting(true);
    try {
      await userService.deleteMe();
      onUserDelete();
    } catch (err) {
      setDeleting(false);
      throw err; // re-throw so the component can show a toast
    }
  };

  return (
    <UserContext.Provider value={{ updateUser, deleteUser, saving, deleting }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
