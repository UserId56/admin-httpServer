import type { AuthResponse } from 'src/API/models/Auth';

export interface UserStore extends AuthResponse {
  isAuth: boolean;
}
