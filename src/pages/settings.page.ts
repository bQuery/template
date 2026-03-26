/**
 * @file Settings page module.
 *
 * Demonstrates:
 * - **Store** persisted settings store (`createPersistedStore`)
 * - **Platform** notifications permission request and sending
 * - **Platform** `storage.local()` for theme persistence
 * - **View** `bq-model` for form controls
 * - **Reactive** watching store changes
 */

import { appStore } from '@/stores/app.store';
import { settingsStore } from '@/stores/settings.store';
import { setPageTitle } from '@/utils/dom.utils';
import { notifications } from '@bquery/bquery/platform';
import { computed, effect, signal } from '@bquery/bquery/reactive';
import { mount } from '@bquery/bquery/view';

/**
 * Render and mount the Settings page into the given container element.
 *
 * @param container - DOM element to render into.
 * @returns Cleanup object with a `destroy()` method.
 */
export function renderSettingsPage(container: HTMLElement): {
  destroy: () => void;
} {
  setPageTitle('Settings');

  /** Notification permission status. */
  const notifPermission = signal(notifications.getPermission());

  /** Whether notifications are supported. */
  const notifSupported = signal(notifications.isSupported());

  /** Show permission banner when notifications are not granted. */
  const showPermissionBanner = computed(
    () => notifSupported.value && notifPermission.value !== 'granted'
  );

  container.innerHTML = /* html */ `
    <div class="page-container">
      <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
        Settings
      </h1>

      <div class="space-y-6 max-w-2xl">

        <!-- Theme Setting -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200
                    dark:border-gray-700 p-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-700 dark:text-gray-300">Theme</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Choose between light and dark mode.
              </p>
            </div>
            <select
              bq-model="theme"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm
                     dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <!-- Language Setting -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200
                    dark:border-gray-700 p-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Language
          </h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-700 dark:text-gray-300">
                Display Language
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Select your preferred language.
              </p>
            </div>
            <select
              bq-model="language"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm
                     dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <!-- Notifications Setting -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200
                    dark:border-gray-700 p-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Notifications
          </h2>

          <!-- Permission Banner -->
          <div
            bq-if="showPermissionBanner"
            class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200
                   dark:border-yellow-800 rounded-lg flex items-center justify-between"
          >
            <p class="text-sm text-yellow-700 dark:text-yellow-400">
              Browser notifications are not enabled.
            </p>
            <button
              bq-on:click="requestPermission"
              class="text-sm font-semibold text-yellow-700 dark:text-yellow-400
                     underline hover:no-underline"
            >
              Enable
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-700 dark:text-gray-300">
                In-App Notifications
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Show toast notifications for important events.
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bq-model="notificationsEnabled"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 rounded-full peer
                          peer-checked:bg-indigo-600 peer-focus:ring-2
                          peer-focus:ring-indigo-300
                          dark:bg-gray-700 transition-colors
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                          after:bg-white after:rounded-full after:h-5 after:w-5
                          after:transition-all peer-checked:after:translate-x-full">
              </div>
            </label>
          </div>
        </div>

        <!-- Test Notification Button -->
        <div class="flex justify-end">
          <button
            bq-on:click="testNotification"
            class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg
                   hover:bg-indigo-700 transition-colors"
          >
            Send Test Notification
          </button>
        </div>

        <!-- Save Indicator -->
        <p class="text-center text-sm text-gray-400 dark:text-gray-500">
          Settings are automatically saved and persisted across page reloads.
        </p>
      </div>
    </div>
  `;

  // Sync settings-store theme changes with app store
  const cleanupThemeSync = effect(() => {
    const theme = settingsStore.theme;
    appStore.setTheme(theme);
  });

  const view = mount(container, {
    theme: settingsStore.theme,
    language: settingsStore.language,
    notificationsEnabled: settingsStore.notificationsEnabled,
    showPermissionBanner,

    requestPermission: async () => {
      const permission = await notifications.requestPermission();
      notifPermission.value = permission;
      if (permission === 'granted') {
        appStore.addNotification({
          type: 'success',
          message: 'Browser notifications enabled!',
          duration: 3000,
        });
      }
    },

    testNotification: () => {
      appStore.addNotification({
        type: 'info',
        message: 'This is a test notification from Settings.',
        duration: 4000,
      });
      if (notifications.getPermission() === 'granted') {
        notifications.send('bQuery Template', {
          body: 'Test notification from Settings page.',
        });
      }
    },
  });

  // Wrap destroy to also clean up the effect
  const originalDestroy = view.destroy;
  view.destroy = () => {
    cleanupThemeSync();
    originalDestroy();
  };

  return view;
}
