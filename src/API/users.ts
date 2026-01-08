import type { AxiosError } from 'axios';
import type { Users } from 'src/models/users';
import { api } from 'src/boot/axios';
import { handleApiError } from './http';

export const getUsers = async (take: number, skip: number): Promise<Array<Users> | null> => {
  try {
    const resp = await api.post<Array<Users>>('/user/query', { take, skip });
    return resp.data;
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

export const updateUser = async (user: Users): Promise<Users | null> => {
  try {
    const resp = await api.post<Users>(`/user/update`, user);
    return resp.data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const createUser = async (user: Users): Promise<Users | null> => {
  try {
    const resp = await api.post<Users>(`/user/create`, user);
    return resp.data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};
