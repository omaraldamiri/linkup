import api from "./api";
import type { LoginDTO, RegisterDTO, AuthResponse } from "../types/authDtos";

export const register = async (data: RegisterDTO): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/register", data);
  return res.data;
};

export const login = async (data: LoginDTO): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
};

/**
 * Initiates the Google OAuth2 browser redirect flow.
 * Spring Security handles the full handshake and redirects back to
 * /oauth2/callback?token=<JWT> on success.
 */
export const loginWithGoogle = (): void => {
  window.location.href = "http://localhost:8080/oauth2/authorization/google";
};
