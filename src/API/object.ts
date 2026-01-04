import { api } from '../boot/axios';
import type { AxiosError } from 'axios';
import { handleApiError } from './http';

export const getObject = async (nameCollection: string, reqData: any): Promise<any | null> => {
  try {
    const resp = await api.post<Array<any>>('/object/' + nameCollection + '/query', reqData);
    return resp;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const getObjectById = async (nameCollection: string, id: number): Promise<any | null> => {
  try {
    const resp = await api.get<any>('/object/' + nameCollection + '/' + id);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const createObject = async (nameCollection: string, object: any): Promise<any | null> => {
  try {
    const resp = await api.post<any>('/object/' + nameCollection, object);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};
export const updateObject = async (
  nameCollection: string,
  id: number,
  object: any,
): Promise<any | null> => {
  try {
    const resp = await api.put<any>('/object/' + nameCollection + '/' + id, object);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};
export const deleteObject = async (nameCollection: string, id: number): Promise<boolean> => {
  try {
    await api.delete('/object/' + nameCollection + '/' + id);
    return true;
  } catch (err) {
    handleApiError(err as AxiosError);
    return false;
  }
};

export const recoverObject = async (nameCollection: string, id: number): Promise<boolean> => {
  try {
    const object = {
      deleted_at: null,
    };
    await api.put('/object/' + nameCollection + '/' + id, object);
    return true;
  } catch (err) {
    handleApiError(err as AxiosError);
    return false;
  }
};
