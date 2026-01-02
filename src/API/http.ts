import { api } from '../boot/axios';
import type { AxiosError } from 'axios';
import { LocalStorage, Notify } from 'quasar';
import type { APIError } from './models/error';
import { useUserStore } from 'src/stores/user-store';

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    LocalStorage.set('access_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    LocalStorage.remove('access_token');
  }
};

export const loadStoredToken = (): boolean => {
  const t = LocalStorage.getItem('access_token');
  if (t) {
    setAuthToken(t as string);
    return true;
  } else {
    return false;
  }
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
