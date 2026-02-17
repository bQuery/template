/**
 * @module AuthService
 * Authentication service responsible for login / logout flows,
 * token management, and user-session persistence.
 *
 * Uses the bQuery platform `storage.local()` adapter to persist
 * tokens and user profiles across page reloads. API calls are
 * simulated with realistic delays since no real backend exists yet.
 */

import type { User } from '@/types';
import { storage, type StorageAdapter } from '@bquery/bquery/platform';

/** Storage key used for the auth token. */
const TOKEN_KEY = 'auth_token';
/** Storage key used for the serialised user object. */
const USER_KEY = 'auth_user';

/** Simulated network latency in milliseconds. */
const SIMULATED_DELAY_MS = 400;

/**
 * Return a promise that resolves after {@link ms} milliseconds.
 *
 * @param ms - Delay duration.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Manages authentication state, token storage, and simulated
 * login / logout flows.
 *
 * @example
 * ```ts
 * import { authService } from "@/services/auth.service";
 *
 * const user = await authService.login("ada@example.com", "password");
 * console.log(user.name); // "Ada Lovelace"
 * ```
 */
class AuthService {
  /** Persistent local-storage adapter. */
  private readonly store: StorageAdapter;

  constructor() {
    this.store = storage.local();
  }

  // -----------------------------------------------------------------------
  // Token helpers
  // -----------------------------------------------------------------------

  /**
   * Read the current auth token from storage.
   *
   * @returns The stored JWT string, or `null` if absent.
   */
  async getToken(): Promise<string | null> {
    return this.store.get<string>(TOKEN_KEY);
  }

  /**
   * Persist a new auth token.
   *
   * @param token - JWT or bearer token to store.
   */
  async setToken(token: string): Promise<void> {
    await this.store.set<string>(TOKEN_KEY, token);
  }

  // -----------------------------------------------------------------------
  // User helpers
  // -----------------------------------------------------------------------

  /**
   * Read the currently stored user profile.
   *
   * @returns The persisted {@link User}, or `null` if not logged in.
   */
  async getUser(): Promise<User | null> {
    return this.store.get<User>(USER_KEY);
  }

  /**
   * Persist a user profile to storage.
   *
   * @param user - The {@link User} object to store.
   */
  async setUser(user: User): Promise<void> {
    await this.store.set<User>(USER_KEY, user);
  }

  // -----------------------------------------------------------------------
  // Auth status
  // -----------------------------------------------------------------------

  /**
   * Determine whether the user is currently authenticated.
   *
   * A session is considered valid when both a token **and** a user
   * profile are present in storage.
   *
   * @returns `true` if authenticated.
   */
  async isAuthenticated(): Promise<boolean> {
    const [token, user] = await Promise.all([this.getToken(), this.getUser()]);
    return token !== null && user !== null;
  }

  // -----------------------------------------------------------------------
  // Login / Logout
  // -----------------------------------------------------------------------

  /**
   * Simulate an authentication request.
   *
   * Accepts any non-empty email / password combination and returns a
   * mock {@link User}. In a real application this method would call a
   * remote authentication endpoint.
   *
   * @param email    - User email address.
   * @param password - User password (not validated in simulation).
   * @returns The authenticated user profile.
   * @throws {Error} If email or password are empty.
   */
  async login(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    // Simulate network round-trip
    await delay(SIMULATED_DELAY_MS);

    const simulatedToken = `sim_${crypto.randomUUID()}`;

    const user: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0] ?? 'User',
      role: 'viewer',
    };

    await Promise.all([this.setToken(simulatedToken), this.setUser(user)]);

    return user;
  }

  /**
   * Log the user out by clearing all auth-related storage entries.
   */
  async logout(): Promise<void> {
    await Promise.all([
      this.store.remove(TOKEN_KEY),
      this.store.remove(USER_KEY),
    ]);
  }
}

/**
 * Pre-instantiated singleton authentication service.
 * Import this directly instead of creating new instances.
 */
export const authService = new AuthService();
