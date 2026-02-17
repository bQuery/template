/**
 * @file About page module.
 *
 * Static informational page that demonstrates:
 * - **Security** sanitization with an HTML preview feature
 * - **Motion** fade-in animations on mount
 * - **View** directives for conditional rendering
 */

import { setPageTitle } from '@/utils/dom.utils';
import { animate, keyframePresets } from '@bquery/bquery/motion';
import { computed, signal } from '@bquery/bquery/reactive';
import { escapeHtml, sanitize } from '@bquery/bquery/security';
import { mount } from '@bquery/bquery/view';

/**
 * Render and mount the About page into the given container element.
 *
 * @param container - DOM element to render into.
 * @returns Cleanup object with a `destroy()` method.
 */
export function renderAboutPage(container: HTMLElement): {
  destroy: () => void;
} {
  setPageTitle('About');

  /** Raw HTML input for the sanitization preview demo. */
  const rawHtml = signal(
    '<b>Hello</b> <em>world</em>! <script>alert("xss")</script>'
  );

  /** Sanitized output — safe to render. */
  const sanitizedHtml = computed(() => sanitize(rawHtml.value));

  /** Escaped version shown as source code. */
  const escapedSource = computed(() => escapeHtml(rawHtml.value));

  /** Whether preview section should be visible. */
  const showPreview = signal(true);

  container.innerHTML = /* html */ `
    <page-container>
      <section class="mb-12 animate-target">
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
          About bQuery Template
        </h1>
        <div class="prose dark:prose-invert max-w-none">
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            This template is a reference implementation for building single-page
            applications with <strong>bQuery.js</strong>.  It showcases every core
            module — reactive state, web components, routing, view directives,
            motion, security, platform APIs, and stores — in a cohesive,
            production-ready architecture.
          </p>
        </div>
      </section>

      <!-- Technology Stack -->
      <section class="mb-12 animate-target">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Technology Stack
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <p class="text-2xl mb-2">🐰</p>
            <p class="font-semibold text-gray-900 dark:text-white">Bun</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Runtime &amp; bundler</p>
          </div>
          <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <p class="text-2xl mb-2">🔷</p>
            <p class="font-semibold text-gray-900 dark:text-white">TypeScript</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Strict type safety</p>
          </div>
          <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <p class="text-2xl mb-2">🌊</p>
            <p class="font-semibold text-gray-900 dark:text-white">Tailwind CSS</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Utility-first styling</p>
          </div>
          <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <p class="text-2xl mb-2">⚡</p>
            <p class="font-semibold text-gray-900 dark:text-white">bQuery</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">DOM &amp; reactivity</p>
          </div>
        </div>
      </section>

      <!-- Security Demo: HTML Sanitization -->
      <section class="animate-target">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          🔒 Security: HTML Sanitization Demo
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Raw HTML input (try adding &lt;script&gt; tags):
            </label>
            <textarea
              bq-model="rawHtml"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm
                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                     dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>

          <div class="flex items-center gap-2">
            <button
              bq-on:click="togglePreview"
              class="text-sm text-indigo-600 dark:text-indigo-400 underline hover:no-underline"
            >
              Toggle Preview
            </button>
          </div>

          <div bq-if="showPreview" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Escaped Source
              </p>
              <pre class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm overflow-auto">
                <code bq-text="escapedSource"></code>
              </pre>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Sanitized Output (safe to render)
              </p>
              <div
                bq-html="sanitizedHtml"
                class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm"
              ></div>
            </div>
          </div>
        </div>
      </section>
    </page-container>
  `;

  // Animate sections on mount
  const sections = container.querySelectorAll('.animate-target');
  sections.forEach((section, index) => {
    animate(section, {
      keyframes: keyframePresets.fadeIn(),
      options: { duration: 400, delay: index * 100, easing: 'ease-out' },
    });
  });

  const view = mount(container, {
    rawHtml,
    sanitizedHtml,
    escapedSource,
    showPreview,
    togglePreview: () => {
      showPreview.value = !showPreview.value;
    },
  });

  return view;
}
