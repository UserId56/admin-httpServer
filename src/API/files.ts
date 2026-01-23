import type { AxiosError, AxiosResponse } from 'axios';
import { api } from 'src/boot/axios';
import { handleApiError } from './http';
import type { File } from 'src/models/files';

export const uploadFile = async (formData: FormData): Promise<AxiosResponse | null> => {
  try {
    const resp = await api.post<File>('/file/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return resp;
  } catch (err) {
    await handleApiError(err as AxiosError);
    return null;
  }
};

export const deleteFile = async (fileId: string): Promise<boolean> => {
  try {
    await api.delete('/file/delete/' + fileId);
    return true;
  } catch (err) {
    await handleApiError(err as AxiosError);
    return false;
  }
};

export const getFileMetaById = async (fileId: string): Promise<AxiosResponse | null> => {
  try {
    const resp = await api.get<AxiosResponse>('/file/meta/' + fileId);
    return resp;
  } catch (err) {
    await handleApiError(err as AxiosError);
    return null;
  }
};

export const downloadFile = async (fileId: string): Promise<Blob | null> => {
  try {
    const resp = await api.get<Blob>('/file/get/' + fileId, {
      responseType: 'blob',
    });
    return resp.data;
  } catch (err) {
    await handleApiError(err as AxiosError);
    return null;
  }
};
