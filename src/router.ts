/**
 * @file Router configuration for the bQuery template application.
 *
 * Sets up all application routes using `createRouter` from bQuery's
 * router module, applies the authentication navigation guard, and
 * integrates page transitions via the Motion module.
 */

import { createAuthGuard } from '@/guards/auth.guard';
import { transition } from '@bquery/bquery/motion';
import { createRouter, type Route, type Router } from '@bquery/bquery/router';

// Page renderers — lazy-loaded via dynamic import for code-splitting
const pageModules = {
  home: () => import('@/pages/home.page'),
  about: () => import('@/pages/about.page'),
  dashboard: () => import('@/pages/dashboard.page'),
  login: () => import('@/pages/login.page'),
  settings: () => import('@/pages/settings.page'),
  notFound: () => import('@/pages/not-found.page'),
};

/** Currently active page view (stores the destroy handle). */
let activeView: { destroy: () => void } | null = null;

/**
 * Get the router outlet element from the DOM.
 *
 * @returns The outlet element.
 * @throws If the element is not found.
 */
function getOutlet(): HTMLElement {
  const outlet = document.getElementById('router-outlet');
  if (!outlet) {
    throw new Error('Router outlet element #router-outlet not found.');
  }
  return outlet;
}

/**
 * Destroy the current active page view before rendering a new one.
 */
function destroyActiveView(): void {
  if (activeView) {
    activeView.destroy();
    activeView = null;
  }
}

/**
 * Create and configure the application router.
 *
 * Registers all routes, applies the auth guard, and handles page
 * transitions with the Motion module.
 *
 * @returns The configured {@link Router} instance.
 */
export function setupRouter(): Router {
  const router = createRouter({
    routes: [
      {
        path: '/',
        name: 'home',
        component: () => pageModules.home(),
      },
      {
        path: '/about',
        name: 'about',
        component: () => pageModules.about(),
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => pageModules.dashboard(),
      },
      {
        path: '/dashboard/:section',
        name: 'dashboard-section',
        component: () => pageModules.dashboard(),
      },
      {
        path: '/login',
        name: 'login',
        component: () => pageModules.login(),
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => pageModules.settings(),
      },
      {
        path: '*',
        name: 'not-found',
        component: () => pageModules.notFound(),
      },
    ],
  });

  // Register the authentication guard
  router.beforeEach(createAuthGuard());

  const renderRoute = async (to: Route): Promise<void> => {
    const outlet = getOutlet();

    // Use View Transitions for smooth page changes
    await transition(async () => {
      destroyActiveView();

      const routeName = to.matched?.name ?? 'not-found';

      const loaderKey = routeName.startsWith('dashboard')
        ? 'dashboard'
        : (routeName as keyof typeof pageModules);
      const loader = pageModules[loaderKey] ?? pageModules.notFound;

      const mod = await loader();

      // Each page module exports a render function named render<Name>Page
      const renderFn = Object.values(mod).find(
        (v) => typeof v === 'function'
      ) as ((el: HTMLElement) => { destroy: () => void }) | undefined;

      if (renderFn) {
        activeView = renderFn(outlet);
      } else {
        outlet.innerHTML =
          "<p class='p-8 text-red-500'>Failed to load page.</p>";
      }
    });
  };

  // Render pages on route changes
  router.afterEach((to) => {
    void renderRoute(to);
  });

  // Initial render for first page load (createRouter syncs route but does not fire afterEach)
  void renderRoute(router.currentRoute.value);

  return router;
}
