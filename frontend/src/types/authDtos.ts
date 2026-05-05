import type { UserDTO } from "./userDtos";
import type { WorkspaceDTO } from "./workspaceDtos";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  name: string;
  password: string;
  imageUrl?: string;
}

export interface AuthResponse {
  token: string;
  userDTO: UserDTO;
  workspaceDTOList: WorkspaceDTO[];
}
