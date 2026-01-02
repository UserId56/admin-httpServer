import { api } from '../boot/axios';
import type { AxiosError } from 'axios';
import type { LoginParams, AuthResponse, User } from './models/Auth';
import { setAuthToken, handleApiError } from './http';
import type { User as UserProfile } from 'src/models/user';

// Методы API для аутентификации

export const login = async (params: LoginParams): Promise<User | null> => {
  try {
    const resp = await api.post<AuthResponse>('/user/login', params);
    const data = resp.data;
    // Сохраняем токен и ставим заголовок
    setAuthToken(data.user?.access_token || null);
    return data.user;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post('/user/logout');
  } catch (err) {
    handleApiError(err as AxiosError);
  } finally {
    setAuthToken(null);
  }
};

export const getProfile = async (): Promise<UserProfile | null | AxiosError> => {
  try {
    const resp = await api.get<UserProfile>('/user/profile');
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return err as null;
  }
};

// При необходимости: refreshToken, getProfile и т.п.
