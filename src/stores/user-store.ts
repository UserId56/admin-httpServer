import { defineStore } from 'pinia';
import type { LoginParams } from 'src/API/models/Auth';
import { AuthAPI } from '../API';
import type { User } from 'src/models/user';
import type { AxiosError } from 'axios';
import { LocalStorage } from 'quasar';

interface UserStore {
  user: User | null;
  isAuth: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserStore => ({
    user: null as User | null,
    isAuth: false,
  }),
  getters: {},
  actions: {
    async login(data: LoginParams) {
      try {
        const result = await AuthAPI.login(data);
        if (result) {
          this.setAuth();
          await this.getProfile();
        }
      } catch (error) {
        //   Переход на страницу ошибки
        console.error('Login error:', error);
      }
    },
    async logout() {
      await AuthAPI.logout();
    },
    async getProfile() {
      const profile = await AuthAPI.getProfile();
      if (profile?.status === 401) {
        throw profile as AxiosError;
      }
      if (profile) {
        this.setUser(profile as User);
      }
    },
    setAuth() {
      this.isAuth = true;
    },
    setNotAuth() {
      this.isAuth = false;
      this.user = null;
      LocalStorage.removeItem('access_token');
    },
    setUser(user: User) {
      this.user = user;
    },
  },
});
