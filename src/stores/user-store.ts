import { defineStore } from 'pinia';
import type { LoginParams, User } from 'src/API/models/Auth';
import { AuthAPI } from '../API';
import type { UserStore } from './models/userStore';

export const useUserStore = defineStore('user', {
  state: (): UserStore => ({
    user: null as User | null,
    isAuth: false,
  }),
  getters: {},
  actions: {
    async login(data: LoginParams) {
      const result = await AuthAPI.login(data);
      if (result) {
        this.setAuth();
        this.setUser(result);
      }
    },
    async logout() {
      await AuthAPI.logout();
    },
    setAuth() {
      this.isAuth = true;
    },
    setUser(user: User) {
      this.user = user;
    },
  },
});
