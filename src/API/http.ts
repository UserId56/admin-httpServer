import { api } from '../boot/axios';
import type { AxiosError } from 'axios';
import { LocalStorage, Notify } from 'quasar';
import type { APIError } from './models/error';
import { useUserStore } from 'src/stores/user-store';
import { RoleAPI } from '.';

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    LocalStorage.set('access_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    LocalStorage.remove('access_token');
  }
};

export const setRoleId = (roleId: number | null) => {
  if (roleId !== null) {
    LocalStorage.set('role_id', roleId);
  } else {
    LocalStorage.remove('role_id');
  }
};

export const loadStoredToken = async (): Promise<boolean> => {
  const t = LocalStorage.getItem('access_token');
  const roleId = LocalStorage.getItem('role_id');
  if (roleId && t) {
    setAuthToken(t as string);
    const p = await RoleAPI.getRoleById(roleId as number);
    if (!p) {
      return false;
    }
    const userStore = useUserStore();
    userStore.setPermission(p.permission);
    return true;
  } else {
    return false;
  }
};

export const setPermission = (permission: Array<string> | null) => {
  LocalStorage.set('permission', permission ? JSON.stringify(permission) : '[]');
  const userStore = useUserStore();
  userStore.setPermission(permission);
};

// Простейший обработчик ошибок (можно расширить)
export const handleApiError = (err: AxiosError) => {
  if (err.response?.status === 401) {
    const userStore = useUserStore();
    userStore.setNotAuth();
  }
  Notify.create({
    type: 'negative',
    message: (err.response?.data as APIError)?.error || err.code + ': ' + err.message,
    position: 'top-right',
  });
};
