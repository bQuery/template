/**
 * @file Login page module.
 *
 * Demonstrates:
 * - **View** two-way binding (`bq-model`) for form inputs
 * - **Store** authentication actions
 * - **Motion** transition on form submission
 * - **Security** input escaping
 * - **Platform** notifications on login success
 */

import { appStore } from '@/stores/app.store';
import { authStore } from '@/stores/auth.store';
import { setPageTitle } from '@/utils/dom.utils';
import { transition } from '@bquery/bquery/motion';
import { notifications } from '@bquery/bquery/platform';
import { computed, signal } from '@bquery/bquery/reactive';
import { navigate } from '@bquery/bquery/router';
import { escapeHtml } from '@bquery/bquery/security';
import { mount } from '@bquery/bquery/view';

/**
 * Render and mount the Login page into the given container element.
 *
 * @param container - DOM element to render into.
 * @returns Cleanup object with a `destroy()` method.
 */
export function renderLoginPage(container: HTMLElement): {
  destroy: () => void;
} {
  setPageTitle('Login');

  const email = signal('');
  const password = signal('');
  const errorMessage = signal('');
  const isSubmitting = signal(false);

  /** Form is valid when both fields have content. */
  const isValid = computed(
    () => email.value.length > 0 && password.value.length > 0
  );

  /** Whether the error message should be shown. */
  const hasError = computed(() => errorMessage.value.length > 0);

  container.innerHTML = /* html */ `
    <div class="page-container">
      <div class="max-w-md mx-auto mt-12">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign In
          </h1>
          <p class="mt-2 text-gray-500 dark:text-gray-400">
            Enter any email and password to simulate login.
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200
                    dark:border-gray-700 p-6 shadow-sm">
          <!-- Error Message -->
          <div
            bq-if="hasError"
            class="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200
                   dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400"
          >
            <span bq-text="errorMessage"></span>
          </div>

          <!-- Login Form -->
          <form bq-on:submit="handleLogin" class="space-y-4">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                bq-model="email"
                placeholder="you@example.com"
                autocomplete="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                bq-model="password"
                placeholder="••••••••"
                autocomplete="current-password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>

            <button
              type="submit"
              bq-bind:disabled="isSubmitDisabled"
              class="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg
                     hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors text-sm"
            >
              <span bq-if="isSubmitting">Signing in…</span>
              <span bq-if="isNotSubmitting">Sign In</span>
            </button>
          </form>

          <p class="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
            This is a demo — no real authentication occurs.
          </p>
        </div>
      </div>
    </div>
  `;

  const view = mount(container, {
    email,
    password,
    errorMessage,
    hasError,
    isSubmitting,
    isNotSubmitting: computed(() => !isSubmitting.value),
    isSubmitDisabled: computed(() => !isValid.value || isSubmitting.value),

    handleLogin: async (e: Event) => {
      e.preventDefault();
      errorMessage.value = '';
      isSubmitting.value = true;

      try {
        const safeEmail = escapeHtml(email.value.trim());
        const user = await authStore.login(safeEmail, password.value);

        appStore.addNotification({
          type: 'success',
          message: `Welcome back, ${user.name}!`,
          duration: 3000,
        });

        // Send a browser notification if permitted
        if (notifications.getPermission() === 'granted') {
          notifications.send('bQuery Template', {
            body: `Logged in as ${user.name}`,
          });
        }

        await transition(() => {
          navigate('/dashboard');
        });
      } catch (err) {
        errorMessage.value =
          err instanceof Error ? err.message : 'Login failed.';
      } finally {
        isSubmitting.value = false;
      }
    },
  });

  return view;
}
