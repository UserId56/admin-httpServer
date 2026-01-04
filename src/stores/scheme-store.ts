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
    // async createScheme(schemeData: Partial<Scheme>) {
    //   try {
    //     const newScheme = await SchemeAPI.createScheme(schemeData);
    //     if (newScheme) {
    //       this.ListSchemes.push(newScheme);
    //     }
    //   } catch (error) {
    //     console.error('Error creating scheme:', error);
    //   }
    // },
    // async updateScheme(id: number, schemeData: Partial<Scheme>) {
    //   try {
    //     const updatedScheme = await SchemeAPI.updateScheme(schemeData);
    //     if (updatedScheme) {
    //       const index = this.ListSchemes.findIndex((scheme) => scheme.ID === id);
    //       if (index !== -1) {
    //         this.ListSchemes[index] = updatedScheme;
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error updating scheme:', error);
    //   }
    // },
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
