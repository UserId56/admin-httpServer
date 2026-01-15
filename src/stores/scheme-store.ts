import { defineStore } from 'pinia';
import { SchemeAPI } from 'src/API';
import type { Scheme } from 'src/models/scheme';

interface SchemeStore {
  ListSchemes: Array<Scheme>;
}

export const useSchemeStore = defineStore('scheme', {
  state: (): SchemeStore => ({
    ListSchemes: [],
  }),
  getters: {
    getList: (state) => state.ListSchemes,
    getSchemeByName: (state) => {
      return (name: string): Scheme | undefined => {
        return state.ListSchemes.find((scheme) => scheme.name === name);
      };
    },
  },
  actions: {
    async getSchemes(take = 25, skip = 0) {
      try {
        const schemes = await SchemeAPI.getSchemes(take, skip);
        if (schemes) {
          this.ListSchemes = schemes;
        }
      } catch (error) {
        console.error('Error fetching schemes:', error);
      }
    },
    async deleteScheme(name: string) {
      try {
        const success = await SchemeAPI.deleteScheme(name);
        if (success) {
          this.ListSchemes = this.ListSchemes.filter((scheme) => scheme.name !== name);
        }
      } catch (error) {
        console.error('Error deleting scheme:', error);
      }
    },
  },
});
