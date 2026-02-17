/**
 * @module AuthGuard
 * Navigation guard that protects routes requiring authentication
 * and redirects unauthenticated users to the login page.
 */

import { authStore } from '@/stores/auth.store';
import { navigate, type Route } from '@bquery/bquery/router';

/**
 * A function that determines whether a navigation should proceed.
 *
 * Return `false` (or a promise resolving to `false`) to cancel the
 * navigation. Return `true` or `void` to allow it.
 */
export type NavigationGuard = (
  to: Route,
  from: Route
) => boolean | void | Promise<boolean | void>;

/** Paths (and their sub-paths) that require an authenticated session. */
const PROTECTED_PATHS = ['/dashboard', '/settings'] as const;

/**
 * Check whether a given path is protected by the auth guard.
 *
 * @param path - The path to check.
 * @returns `true` when the path starts with one of the {@link PROTECTED_PATHS}.
 */
function isProtectedPath(path: string): boolean {
  return PROTECTED_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Create a {@link NavigationGuard} that enforces authentication rules.
 *
 * - If the user is **not** authenticated and navigates to a protected
 *   path, they are redirected to `/login` and the navigation is cancelled.
 * - If the user **is** authenticated and navigates to `/login`, they are
 *   redirected to `/dashboard` and the navigation is cancelled.
 * - All other navigations are allowed.
 *
 * @returns A reusable {@link NavigationGuard} function.
 *
 * @example
 * ```ts
 * import { createAuthGuard } from "@/guards/auth.guard";
 * import { registerGuard } from "@bquery/bquery/router";
 *
 * registerGuard(createAuthGuard());
 * ```
 */
export function createAuthGuard(): NavigationGuard {
  return (to: Route, _from: Route): boolean => {
    const authenticated = authStore.isAuthenticated;

    if (!authenticated && isProtectedPath(to.path)) {
      navigate('/login');
      return false;
    }

    if (authenticated && to.path === '/login') {
      navigate('/dashboard');
      return false;
    }

    return true;
  };
}
