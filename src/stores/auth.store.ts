/**
 * @file Authentication store.
 *
 * Holds the reactive session state (user/token) and delegates auth
 * operations to the auth service.
 */

import { authService } from '@/services/auth.service';
import type { User } from '@/types';
import { createStore } from '@bquery/bquery/store';

type AuthState = {
  user: User | null;
  token: string | null;
};

type AuthGetters = {
  isAuthenticated: boolean;
  userName: string;
  userRole: 'admin' | 'editor' | 'viewer';
};

type AuthActions = {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  setUser(user: User | null): void;
  setToken(token: string | null): void;
  hydrate(): Promise<void>;
};

/**
 * Authentication store.
 *
 * Wraps {@link authService} to expose reactive auth state and
 * convenient actions for login, logout, and session hydration.
 */
export const authStore = createStore<AuthState, AuthGetters, AuthActions>({
  id: 'auth',

  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null && state.token !== null,
    userName: (state) => (state.user as User | null)?.name ?? 'Guest',
    userRole: (state) => (state.user as User | null)?.role ?? 'viewer',
  },

  actions: {
    async login(email: string, password: string): Promise<User> {
      const user = await authService.login(email, password);
      const token = await authService.getToken();
      this.user = user;
      this.token = token;
      return user;
    },

    async logout(): Promise<void> {
      await authService.logout();
      this.user = null;
      this.token = null;
    },

    setUser(user: User | null) {
      this.user = user;
    },

    setToken(token: string | null) {
      this.token = token;
    },

    async hydrate(): Promise<void> {
      const [user, token] = await Promise.all([
        authService.getUser(),
        authService.getToken(),
      ]);
      this.user = user;
      this.token = token;
    },
    // NOTE: bQuery currently types `this` in actions dynamically at runtime.
    // This cast is limited to store action typing interop.
  } as any,
});
