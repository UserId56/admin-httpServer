import { defineStore } from 'pinia';
import { SettingsAPI } from 'src/API/';
import type { Settings } from 'src/models/settings';

export const useSettingsStore = defineStore('settings', {
  state: (): Settings => ({
    lang: ['ru'] as Array<string>,
    time_zone: 0 as number,
    default_role_id: null as number | null,
  }),
  getters: {
    getLang(): Array<string> {
      return this.lang;
    },
    getTimeZone(): number {
      return this.time_zone;
    },
    getSettings: (state): Settings => {
      return state;
    },
  },
  actions: {
    async getSettingsData() {
      const settings = await SettingsAPI.getSettings();
      if (settings) {
        this.$state = settings;
      }
    },
    async updateSettings(newSettings: Settings) {
      const updatedSettings = await SettingsAPI.updateSettings(newSettings);
      if (updatedSettings) {
        this.$state = updatedSettings;
      }
    },
  },
});
