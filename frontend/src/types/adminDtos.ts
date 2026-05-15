export interface AdminStatsDTO {
  totalUsers: number;
  totalWorkspaces: number;
  totalProjects: number;
  totalTasks: number;
  signupsLast7Days: number;
  signupsLast30Days: number;
}

export interface AdminUserRowDTO {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  oAuth2User: boolean;
  enabled: boolean;
  systemAdmin: boolean;
}

export interface AdminWorkspaceRowDTO {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string | null;
  memberCount: number;
  createdAt: string;
}

export interface PagedResponseDTO<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
