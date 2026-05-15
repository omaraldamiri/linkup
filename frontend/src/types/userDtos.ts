export interface UserDTO {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  systemAdmin?: boolean;
}

export interface UpdatedUserDTO {
  email?: string;
  name?: string;
  password?: string;
  image?: string;
}
