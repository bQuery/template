/**
 * @file Application entry point.
 *
 * Bootstraps the entire bQuery template application:
 * 1. Registers all Web Components
 * 2. Hydrates authentication state from storage
 * 3. Initializes the router
 * 4. Mounts the root reactive view
 * 5. Sets up theme, navigation, and notification rendering
 */

import './styles/app.css';

// Register Web Components (side-effect imports)
import './components/layout/app-shell.component';
import './components/layout/page-container.component';
import './components/ui/button.component';
import './components/ui/card.component';
import './components/ui/modal.component';
import './components/ui/navbar.component';
import './components/ui/notification.component';

// Framework imports
import { $, $$ } from '@bquery/bquery/core';
import {
  batch,
  computed,
  effect,
  readonly,
  signal,
  watch,
} from '@bquery/bquery/reactive';
import { currentRoute, interceptLinks } from '@bquery/bquery/router';
import { mount } from '@bquery/bquery/view';

// Application modules
import { setupRouter } from './router';
import { appStore } from './stores/app.store';
import { authStore } from './stores/auth.store';
import { settingsStore } from './stores/settings.store';

/**
 * Initialize and start the application.
 *
 * This function is the single entry point that orchestrates the
 * entire boot process.
 */
async function bootstrap(): Promise<void> {
  // 1. Restore persisted theme from settings store
  const savedTheme = settingsStore.theme;
  appStore.setTheme(savedTheme);

  // 2. Hydrate authentication state from storage
  try {
    await authStore.hydrate();
  } catch {
    // If hydration fails, user simply stays logged out
  }

  // 3. Initialize the router
  setupRouter();

  const globalFilter = signal('');
  const routePath = computed(() => currentRoute.value.path);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const routeLinks = signal([
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/settings', label: 'Settings' },
    { path: '/login', label: 'Login' },
  ]);

  const quickLinks = computed(() => {
    const term = globalFilter.value.trim().toLowerCase();
    const links = routeLinks.value;
    if (!term) return links;
    return links.filter(
      (link) =>
        link.label.toLowerCase().includes(term) ||
        link.path.toLowerCase().includes(term)
    );
  });

  // Root mount required by the template contract.
  mount('#app', {
    routePath,
    isAuthenticated,
    globalFilter,
    quickLinks,
    readonlyFilter: readonly(globalFilter),
  });

  // 4. Intercept <a> clicks for SPA navigation
  interceptLinks(document.body);

  // 5. Reactive theme sync — toggle `dark` class on <html>
  effect(() => {
    const isDark = appStore.isDarkMode;
    document.documentElement.classList.toggle('dark', isDark);
  });

  // 6. Reactive navbar update
  effect(() => {
    const path = currentRoute.value.path;
    const user = authStore.userName;
    const isAuth = authStore.isAuthenticated;
    const isDark = appStore.isDarkMode;

    const navbar = document.querySelector('app-navbar');
    if (navbar) {
      navbar.setAttribute('current-path', path);
      navbar.setAttribute('user-name', user);
      navbar.setAttribute('is-authenticated', String(isAuth));
      navbar.setAttribute('is-dark', String(isDark));
      navbar.classList.toggle('dark', isDark);
    }
  });

  // 7. Listen for theme toggle from navbar
  document.addEventListener('toggle-theme', () => {
    batch(() => {
      appStore.toggleTheme();
      settingsStore.setTheme(appStore.theme);
    });
  });

  // Track route changes and keep layout polished.
  const stopRouteWatch = watch(
    routePath,
    () => {
      $('#router-outlet').scrollTo({ behavior: 'smooth', block: 'start' });
      $$('#router-outlet, app-shell').addClass('route-transitioning');
      setTimeout(() => {
        $$('#router-outlet, app-shell').removeClass('route-transitioning');
      }, 180);
    },
    { immediate: true }
  );

  // Handle component errors centrally without using console.error.
  const onComponentError = (event: Event): void => {
    const customEvent = event as CustomEvent<{
      componentName: string;
      message: string;
    }>;

    const detail = customEvent.detail;
    if (!detail) return;

    appStore.addNotification({
      type: 'error',
      message: `${detail.componentName}: ${detail.message}`,
      duration: 5000,
    });
  };

  document.addEventListener('component-error', onComponentError);

  // 8. Reactive notification rendering
  effect(() => {
    const notifs = appStore.notifications;
    const stack = document.getElementById('notification-stack');
    if (!stack) return;

    stack.innerHTML = notifs
      .map(
        (n: { type: string; message: string }) =>
          `<ui-notification variant="${n.type}" message="${n.message}"></ui-notification>`
      )
      .join('');

    // Attach dismiss handlers
    stack.querySelectorAll('ui-notification').forEach((el, i) => {
      el.addEventListener('dismiss', () => {
        const notif = notifs[i];
        if (notif) appStore.removeNotification(notif.id);
      });
    });
  });

  // Keep references active so TypeScript does not prune callbacks in strict mode.
  void stopRouteWatch;
}

// Boot the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
