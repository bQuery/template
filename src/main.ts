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
import { effect } from '@bquery/bquery/reactive';
import { currentRoute, interceptLinks } from '@bquery/bquery/router';

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
    appStore.toggleTheme();
    settingsStore.setTheme(appStore.theme);
  });

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
}

// Boot the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
