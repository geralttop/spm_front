export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  bio?: string;
}

export interface ProfileResponse {
  sub: string;
  userId: string;
  email: string;
  role?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  sidebarOrder?: string[];
  createdPointsCount?: number;
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
}

export interface SearchUserResult {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  /** Путь к аватару (как в ответе GET /auth/user/...) */
  avatar?: string;
  role?: string;
  createdPointsCount?: number;
}
