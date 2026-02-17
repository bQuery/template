/**
 * @file Persisted settings store.
 *
 * Stores user preferences and keeps them across sessions by using
 * bQuery's persisted store API.
 */

import type { Theme } from '@/types';
import { createPersistedStore, type Store } from '@bquery/bquery/store';

type SettingsState = {
  language: string;
  notificationsEnabled: boolean;
  theme: Theme;
};

type SettingsGetters = { isEnglish: boolean };

type SettingsActions = {
  setLanguage(lang: string): void;
  toggleNotifications(): void;
  setTheme(theme: Theme): void;
};

/**
 * Persisted settings store.
 *
 * Uses {@link createPersistedStore} so that all state changes are
 * transparently written to local storage and rehydrated on page load.
 */
export const settingsStore = createPersistedStore({
  id: 'settings',

  state: () => ({
    language: 'en',
    notificationsEnabled: true,
    theme: 'light' as Theme,
  }),

  getters: {
    isEnglish: (state: SettingsState) => state.language === 'en',
  },

  actions: {
    setLanguage(lang: string) {
      this.language = lang;
    },
    toggleNotifications() {
      this.notificationsEnabled = !this.notificationsEnabled;
    },
    setTheme(theme: Theme) {
      this.theme = theme;
    },
    // NOTE: bQuery currently types `this` in actions dynamically at runtime.
    // This cast is limited to store action typing interop.
  } as any,
  // NOTE: generic constraints for createPersistedStore are broader than our
  // local state/getter/action interfaces, therefore we narrow the result.
} as any) as unknown as Store<SettingsState, SettingsGetters, SettingsActions>;
