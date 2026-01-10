import { api } from '../boot/axios';
import type { AxiosError } from 'axios';
import type { LoginParams, User } from './models/Auth';
import { setAuthToken, handleApiError, setPermission, setRoleId } from './http';
import type { User as UserProfile } from 'src/models/user';
import type Role from 'src/models/roles';

// Методы API для аутентификации

const getRolePermissions = async (roleId: number): Promise<Array<string> | null> => {
  try {
    const resp = await api.get<Role>(`/role/` + roleId);
    return resp.data.permission;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const login = async (params: LoginParams): Promise<User | null> => {
  try {
    const resp = await api.post<User>('/user/login', params);
    const data = resp.data;
    // Сохраняем токен и ставим заголовок
    setAuthToken(data.access_token || null);
    setRoleId(data.role_id || null);
    const permission = await getRolePermissions(data.role_id);
    setPermission(permission);
    return data;
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
