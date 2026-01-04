import { api } from '../boot/axios';
import type { AxiosError } from 'axios';
import { handleApiError } from './http';
import type { Scheme } from 'src/models/scheme';

export const getSchemes = async (take: number, skip: number): Promise<Array<Scheme> | null> => {
  try {
    const resp = await api.get<Array<Scheme>>('/scheme/' + `?take=` + take + `&skip=` + skip);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return [];
  }
};

export const getSchemeByName = async (name: string): Promise<Scheme | null> => {
  try {
    const resp = await api.get(`/scheme/` + name);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const createScheme = async (scheme: Partial<Scheme>): Promise<Scheme | null> => {
  try {
    const resp = await api.post('/scheme/', scheme, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const updateScheme = async (scheme: Partial<Scheme>): Promise<Scheme | null> => {
  try {
    const resp = await api.put(`/scheme/` + scheme.name, scheme);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};
export const deleteScheme = async (name: string): Promise<boolean> => {
  try {
    await api.delete(`/scheme/` + name);
    return true;
  } catch (err) {
    handleApiError(err as AxiosError);
    return false;
  }
};
