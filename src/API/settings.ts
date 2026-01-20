import { api } from '../boot/axios';
import type { AxiosError } from 'axios';
import type { Settings } from 'src/models/settings';
import { handleApiError } from './http';

export const getSettings = async (): Promise<Settings | null> => {
  try {
    const resp = await api.get<Settings>('/settings');
    return resp.data;
  } catch (err) {
    await handleApiError(err as AxiosError);
    return null;
  }
};

export const updateSettings = async (settings: Settings): Promise<Settings | null> => {
  try {
    const resp = await api.put<Settings>('/settings', settings);
    return resp.data;
  } catch (err) {
    await handleApiError(err as AxiosError);
    return null;
  }
};
