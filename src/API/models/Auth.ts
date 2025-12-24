export interface User {
  access_token: string;
  refresh_token: string;
  user_id: number;
  username: string;
  role_id: number;
}

export interface AuthResponse {
  user: User | null;
}

export interface LoginParams {
  username: string;
  email: string;
  password: string;
}
