import type { AppNotification, Theme } from '@/types';
import { createStore } from '@bquery/bquery/store';

type AppState = {
  theme: Theme;
  loading: boolean;
  notifications: AppNotification[];
};

type AppGetters = {
  isDarkMode: boolean;
  hasNotifications: boolean;
  notificationCount: number;
};

type AppActions = {
  toggleTheme(): void;
  setTheme(theme: Theme): void;
  setLoading(loading: boolean): void;
  addNotification(notification: Omit<AppNotification, 'id'>): void;
  removeNotification(id: string): void;
  clearNotifications(): void;
};

/**
 * Global application store.
 *
 * Provides reactive state for the active colour theme, a global
 * loading indicator, and a notification queue with auto-dismiss.
 */
export const appStore = createStore<AppState, AppGetters, AppActions>({
  id: 'app',

  state: () => ({
    theme: 'light' as Theme,
    loading: false,
    notifications: [] as AppNotification[],
  }),

  getters: {
    isDarkMode: (state) => state.theme === 'dark',
    hasNotifications: (state) =>
      (state.notifications as AppNotification[]).length > 0,
    notificationCount: (state) =>
      (state.notifications as AppNotification[]).length,
  },

  actions: {
    toggleTheme() {
      const next: Theme = this.theme === 'light' ? 'dark' : 'light';
      this.theme = next;
      document.documentElement.classList.toggle('dark', next === 'dark');
    },

    setTheme(theme: Theme) {
      this.theme = theme;
      document.documentElement.classList.toggle('dark', theme === 'dark');
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    addNotification(notification: Omit<AppNotification, 'id'>) {
      const entry: AppNotification = {
        ...notification,
        id: crypto.randomUUID(),
      };
      this.notifications = [
        ...(this.notifications as AppNotification[]),
        entry,
      ];
      const duration = notification.duration ?? 5000;
      setTimeout(() => {
        this.removeNotification(entry.id);
      }, duration);
    },

    removeNotification(id: string) {
      this.notifications = (this.notifications as AppNotification[]).filter(
        (n: AppNotification) => n.id !== id,
      );
    },

    clearNotifications() {
      this.notifications = [];
    },
  } as any,
});
