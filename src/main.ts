/**
 * @file Application entry point.
 *
 * Bootstraps the entire bQuery template application:
 * 1. Registers all `@bquery/ui` components
 * 2. Hydrates authentication state from storage
 * 3. Initializes the router
 * 4. Mounts the root reactive view
 * 5. Sets up theme, navigation, and toast notifications
 */

import './styles/app.css';
import '@bquery/ui';

// Framework imports
import { $ } from '@bquery/bquery/core';
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
import { showToast } from '@bquery/ui/components/toast';

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
  const isGuest = computed(() => !authStore.isAuthenticated);
  const userName = computed(() => authStore.userName);
  const isDarkMode = computed(() => appStore.isDarkMode);
  const isLightMode = computed(() => !appStore.isDarkMode);
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
    isGuest,
    userName,
    isDarkMode,
    isLightMode,
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

  // 6. Listen for theme toggles from the root layout
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle?.addEventListener('click', () => {
    batch(() => {
      appStore.toggleTheme();
      settingsStore.setTheme(appStore.theme);
    });
  });

  // Track route changes and keep layout polished.
  const stopRouteWatch = watch(
    routePath,
    () => {
      $('#router-outlet').scrollTo({ behavior: 'smooth' });
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

  // 7. Reactive notification rendering via @bquery/ui toast API
  const activeToastIds = new Set<string>();
  effect(() => {
    const notifs = appStore.notifications;
    const nextIds = new Set(notifs.map((notif) => notif.id));

    activeToastIds.forEach((id) => {
      if (!nextIds.has(id)) activeToastIds.delete(id);
    });

    notifs.forEach((notif) => {
      if (activeToastIds.has(notif.id)) return;

      activeToastIds.add(notif.id);

      const toast = showToast({
        message: notif.message,
        variant: notif.type,
        duration: notif.duration ?? 5000,
      });

      toast.addEventListener(
        'bq-close',
        () => {
          activeToastIds.delete(notif.id);
          appStore.removeNotification(notif.id);
        },
        { once: true }
      );
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
