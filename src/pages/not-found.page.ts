/**
 * @file 404 Not Found page module.
 *
 * Catch-all page displayed when no route matches.
 * Demonstrates **Motion** animations for the error illustration.
 */

import { setPageTitle } from '@/utils/dom.utils';
import { animate, keyframePresets } from '@bquery/bquery/motion';
import { mount } from '@bquery/bquery/view';

/**
 * Render and mount the 404 page into the given container element.
 *
 * @param container - DOM element to render into.
 * @returns Cleanup object with a `destroy()` method.
 */
export function renderNotFoundPage(container: HTMLElement): {
  destroy: () => void;
} {
  setPageTitle('Page Not Found');

  container.innerHTML = /* html */ `
    <page-container>
      <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p class="error-number text-8xl font-extrabold text-indigo-500 mb-4">
          404
        </p>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
          Check the URL or head back home.
        </p>
        <a
          href="/"
          class="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white
                 font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          ← Back to Home
        </a>
      </div>
    </page-container>
  `;

  // Animate the error number on mount
  const errorNumber = container.querySelector('.error-number');
  if (errorNumber) {
    animate(errorNumber, {
      keyframes: keyframePresets.pop(),
      options: { duration: 600, easing: 'ease-out' },
    });
  }

  const view = mount(container, {});

  return view;
}
