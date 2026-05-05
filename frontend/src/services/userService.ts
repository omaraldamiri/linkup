import api from "./api";
import type { UserDTO, UpdatedUserDTO } from "../types/userDtos";

export const getMe = async (): Promise<UserDTO> => {
  const res = await api.get<UserDTO>("/users/me");
  return res.data;
};

export const updateMe = async (updates: UpdatedUserDTO): Promise<string> => {
  const res = await api.patch<string>("/users/me", updates);
  return res.data;
};

export const deleteMe = async (): Promise<string> => {
  const res = await api.delete<string>("/users/me");
  return res.data;
};
