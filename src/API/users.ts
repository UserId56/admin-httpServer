import type { AxiosError, AxiosResponse } from 'axios';
import type { Users } from 'src/models/users';
import { api } from 'src/boot/axios';
import { handleApiError } from './http';
import type { ReqData } from 'src/models/query';

export const getUsers = async (reqData: ReqData): Promise<AxiosResponse | null> => {
  try {
    const resp = await api.post<AxiosResponse>('/user/query', reqData);
    return resp;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const getUserById = async (id: number): Promise<Users | null> => {
  try {
    const resp = await api.get<Users>(`/user/${id}`);
    return resp.data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    const resp = await api.delete<boolean>(`/user/${id}`);
    return resp.data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return false;
  }
};

export const updateUser = async (id: number, user: Partial<Users>): Promise<Users | null> => {
  try {
    const resp = await api.put<Users>(`/user/` + id, user);
    return resp.data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const createUser = async (user: Users): Promise<Users | null> => {
  try {
    const resp = await api.post<Users>(`/user/`, user);
    return resp.data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};
