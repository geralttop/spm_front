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
  username: string;
  bio?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
}

export interface SearchUserResult {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}
