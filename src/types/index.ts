/**
 * @module types
 * Shared TypeScript types and interfaces used throughout the application.
 * Centralises all domain models, state shapes, and utility types
 * so every module imports from a single source of truth.
 */

// ---------------------------------------------------------------------------
// Domain Models
// ---------------------------------------------------------------------------

/**
 * Represents an authenticated user of the application.
 */
export interface User {
  /** Unique identifier. */
  id: string;
  /** User email address. */
  email: string;
  /** Display name. */
  name: string;
  /** Optional avatar URL. */
  avatar?: string;
  /** Role used for authorisation checks. */
  role: 'admin' | 'editor' | 'viewer';
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Describes the current authentication state.
 */
export interface AuthState {
  /** The currently authenticated user, or `null` when logged out. */
  user: User | null;
  /** JWT / bearer token, or `null` when not authenticated. */
  token: string | null;
  /** Convenience flag derived from `user` and `token`. */
  isAuthenticated: boolean;
}

// ---------------------------------------------------------------------------
// Theming
// ---------------------------------------------------------------------------

/**
 * Supported visual themes.
 */
export type Theme = 'light' | 'dark';

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

/**
 * A single in-app notification displayed to the user.
 */
export interface AppNotification {
  /** Unique identifier for the notification. */
  id: string;
  /** Visual severity / intent of the notification. */
  type: 'success' | 'error' | 'info' | 'warning';
  /** Human-readable message shown to the user. */
  message: string;
  /** Auto-dismiss duration in milliseconds. Omit for sticky notifications. */
  duration?: number;
}

// ---------------------------------------------------------------------------
// Application State
// ---------------------------------------------------------------------------

/**
 * Top-level application UI state.
 */
export interface AppState {
  /** Active colour theme. */
  theme: Theme;
  /** Whether a global loading indicator should be visible. */
  loading: boolean;
  /** Active in-app notifications. */
  notifications: AppNotification[];
}

/**
 * State shape for a simple counter feature.
 */
export interface CounterState {
  /** Current counter value. */
  count: number;
}

/**
 * User-configurable application settings.
 */
export interface SettingsState {
  /** BCP-47 language tag (e.g. `"en"`, `"de"`). */
  language: string;
  /** Whether push / in-app notifications are enabled. */
  notificationsEnabled: boolean;
  /** Preferred colour theme. */
  theme: Theme;
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

/**
 * Canonical route name constants used for programmatic navigation.
 */
export enum RouteNames {
  HOME = 'home',
  ABOUT = 'about',
  DASHBOARD = 'dashboard',
  LOGIN = 'login',
  SETTINGS = 'settings',
  NOT_FOUND = 'not-found',
}

/**
 * Describes a single navigation link rendered in menus / nav bars.
 */
export interface NavLink {
  /** URL path the link points to. */
  path: string;
  /** Human-readable label displayed in the UI. */
  label: string;
  /** Optional icon identifier (e.g. an icon-font class or SVG name). */
  icon?: string;
  /** When `true` the link is only shown to authenticated users. */
  requiresAuth?: boolean;
}

// ---------------------------------------------------------------------------
// API Utilities
// ---------------------------------------------------------------------------

/**
 * Generic wrapper returned by every API call.
 *
 * @typeParam T - The shape of the response payload.
 */
export interface ApiResponse<T> {
  /** Response payload. */
  data: T;
  /** HTTP status code. */
  status: number;
  /** Optional human-readable status message. */
  message?: string;
}

/**
 * Extended `Error` thrown by API service methods.
 *
 * @example
 * ```ts
 * throw new ApiError("Not found", 404);
 * ```
 */
export class ApiError extends Error {
  /** HTTP status code associated with the error. */
  public readonly status: number;
  /** Optional structured details returned by the server. */
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
