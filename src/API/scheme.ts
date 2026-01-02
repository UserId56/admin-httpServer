import { api } from '../boot/axios';
import type { AxiosError } from 'axios';
import { handleApiError } from './http';
import type { Scheme } from 'src/models/scheme';

export const getSchemes = async (take: number, skip: number): Promise<Array<Scheme> | null> => {
  try {
    const resp = await api.get<Array<Scheme>>('/scheme' + `?take=` + take + `&skip=` + skip);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return [];
  }
};

export const getSchemeByName = async (name: string): Promise<Scheme | null> => {
  try {
    const resp = await api.get<Scheme>(`/scheme/` + name);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const createScheme = async (scheme: Partial<Scheme>): Promise<Scheme | null> => {
  try {
    const resp = await api.post<Scheme>('/scheme', scheme);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const updateScheme = async (id: number, scheme: Partial<Scheme>): Promise<Scheme | null> => {
  try {
    const resp = await api.put<Scheme>(`/scheme/` + id, scheme);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};
export const deleteScheme = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`/scheme/` + id);
    return true;
  } catch (err) {
    handleApiError(err as AxiosError);
    return false;
  }
};
