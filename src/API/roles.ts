import { api } from '../boot/axios';
import type { AxiosError } from 'axios';
import { handleApiError } from './http';
import type { Role } from 'src/models/roles';

export const getRoles = async (
  take: number = 25,
  skip: number = 0,
): Promise<Array<Role> | null> => {
  try {
    const resp = await api.post<Array<Role>>('/role/query', { take, skip });
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return [];
  }
};

export const getRoleById = async (id: number): Promise<Role | null> => {
  try {
    const resp = await api.get(`/role/` + id);
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};
export const createRole = async (role: Partial<Role>): Promise<Role | null> => {
  try {
    const resp = await api.post('/role/', role, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};

export const updateRole = async (role: Partial<Role>): Promise<Role | null> => {
  try {
    const resp = await api.put(`/role/` + role.ID, role, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = resp.data;
    return data;
  } catch (err) {
    handleApiError(err as AxiosError);
    return null;
  }
};
export const deleteRole = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`/role/` + id);
    return true;
  } catch (err) {
    handleApiError(err as AxiosError);
    return false;
  }
};
