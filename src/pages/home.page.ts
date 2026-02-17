/**
 * @file Home page module.
 *
 * Landing page for the template app.  Demonstrates:
 * - **Reactive** signals with the counter store
 * - **View** directives (`bq-text`, `bq-on:click`, `bq-class`)
 * - **Motion** spring animations on the counter button
 * - **Component** usage of `<ui-card>` and `<ui-button>`
 */

import { counterStore } from '@/stores/counter.store';
import { setPageTitle } from '@/utils/dom.utils';
import { sanitizeUserContent } from '@/utils/sanitize.utils';
import { $, $$ } from '@bquery/bquery/core';
import { spring, springPresets } from '@bquery/bquery/motion';
import {
  batch,
  computed,
  readonly,
  signal,
  watch,
} from '@bquery/bquery/reactive';
import { mount } from '@bquery/bquery/view';

/**
 * Render and mount the Home page into the given container element.
 *
 * @param container - DOM element to render into.
 * @returns Cleanup function returned by `mount()`.
 */
export function renderHomePage(container: HTMLElement): {
  destroy: () => void;
} {
  setPageTitle('Home');

  const counterSpring = spring(0, springPresets.bouncy);

  /** Local greeting input signal for the two-way binding demo. */
  const greetingInput = signal('');

  /** Sanitized preview computed from the greeting input. */
  const greetingPreview = computed(() =>
    sanitizeUserContent(greetingInput.value || 'Type something above…')
  );

  /** Whether the greeting input has content. */
  const hasGreeting = computed(() => greetingInput.value.length > 0);
  const readonlyGreeting = readonly(greetingInput);
  const lastCounterChange = signal('No counter changes yet.');

  // Sync spring to counter value
  counterSpring.onChange(() => {
    /* Spring value updated — used purely for visual feedback */
  });

  container.innerHTML = /* html */ `
    <page-container>
      <section class="text-center mb-12">
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Welcome to <span class="text-indigo-500">bQuery</span>
        </h1>
        <p class="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          A modern, lightweight JavaScript framework for building fast SPAs
          with reactive state, web components, and declarative views.
        </p>
      </section>

      <!-- Counter Demo -->
      <section class="mb-12">
        <ui-card card-title="Reactive Counter" hoverable>
          <div class="flex items-center justify-center gap-6 py-4">
            <button
              bq-on:click="decrement"
              class="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-lg
                     hover:bg-red-200 transition-colors dark:bg-red-900 dark:text-red-300"
            >
              −
            </button>
            <div class="text-center">
              <span
                bq-text="count"
                class="text-5xl font-extrabold text-gray-900 dark:text-white tabular-nums"
              ></span>
              <p class="text-sm text-gray-400 mt-1">
                Doubled: <span bq-text="doubled" class="font-semibold text-indigo-500"></span>
              </p>
            </div>
            <button
              bq-on:click="increment"
              class="w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold text-lg
                     hover:bg-green-200 transition-colors dark:bg-green-900 dark:text-green-300"
            >
              +
            </button>
          </div>
          <div class="flex justify-center mt-2">
            <button
              bq-on:click="reset"
              class="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline transition-colors"
            >
              Reset
            </button>
          </div>
        </ui-card>
      </section>

      <!-- Two-Way Binding Demo -->
      <section class="mb-12">
        <ui-card card-title="Two-Way Binding Demo" hoverable>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter some text (supports basic HTML):
              </label>
              <input
                type="text"
                bq-model="greetingInput"
                placeholder="Type here…"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       dark:bg-gray-800 dark:border-gray-600 dark:text-white
                       transition-shadow"
              />
            </div>
            <div
              bq-if="hasGreeting"
              class="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"
            >
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Sanitized preview:</p>
              <p bq-html="greetingPreview" class="text-gray-800 dark:text-gray-200"></p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Read-only mirror:
                <span bq-text="readonlyGreeting"></span>
              </p>
            </div>
          </div>
        </ui-card>
      </section>

      <!-- Feature Cards -->
      <section>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Core Modules
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ui-card card-title="⚡ Reactive" hoverable>
            <p>Signals, computed values, effects, and batched updates for fine-grained reactivity.</p>
          </ui-card>
          <ui-card card-title="🧩 Components" hoverable>
            <p>Web Components with Shadow DOM, props validation, and lifecycle hooks.</p>
          </ui-card>
          <ui-card card-title="🛣️ Router" hoverable>
            <p>SPA router with history API, dynamic segments, guards, and reactive route state.</p>
          </ui-card>
          <ui-card card-title="📦 Store" hoverable>
            <p>Signal-based state management with getters, actions, and optional persistence.</p>
          </ui-card>
          <ui-card card-title="🎬 Motion" hoverable>
            <p>View Transitions, spring physics, FLIP animations, timelines, and scroll animations.</p>
          </ui-card>
          <ui-card card-title="🔒 Security" hoverable>
            <p>HTML sanitization, XSS protection, CSP helpers, and Trusted Types support.</p>
          </ui-card>
        </div>
      </section>

      <section class="mt-12">
        <ui-card card-title="bQuery Core API Playground" hoverable>
          <p class="text-sm mb-3">
            This section demonstrates core methods: selectors, chaining,
            events, delegation, wrapping, scroll helpers, and form
            serialization.
          </p>

          <div
            id="core-demo-box"
            class="rounded border border-dashed border-indigo-300 p-3"
          >
            <p id="core-status" class="text-sm">Core demo booting…</p>
            <p class="text-xs text-gray-500">
              Last counter event: <span bq-text="lastCounterChange"></span>
            </p>
          </div>

          <form id="core-form" class="mt-4 grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              class="rounded border border-gray-300 px-2 py-1"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              class="rounded border border-gray-300 px-2 py-1"
            />
            <button
              type="button"
              bq-on:click="serializeCoreForm"
              class="rounded bg-indigo-600 px-3 py-1 text-white"
            >
              Serialize Form
            </button>
            <button
              id="core-native-plus"
              type="button"
              class="rounded bg-emerald-600 px-3 py-1 text-white"
            >
              Native +5
            </button>
          </form>

          <div id="core-serialized" class="mt-3 text-xs"></div>

          <div class="mt-4 flex gap-2">
            <button
              type="button"
              bq-on:click="toggleWrap"
              class="rounded border border-indigo-500 px-3 py-1 text-indigo-600"
            >
              Toggle Wrap
            </button>
            <button
              type="button"
              bq-on:click="scrollToCards"
              class="rounded border border-indigo-500 px-3 py-1 text-indigo-600"
            >
              Scroll to cards
            </button>
          </div>

          <p id="core-wrap-target" class="mt-3 rounded bg-indigo-50 p-2 text-sm">
            Wrap / unwrap target
          </p>

          <ul id="core-delegate-list" class="mt-3 flex gap-2 text-xs">
            <li>
              <button class="delegate-item rounded bg-gray-100 px-2 py-1" data-item="A">
                Item A
              </button>
            </li>
            <li>
              <button class="delegate-item rounded bg-gray-100 px-2 py-1" data-item="B">
                Item B
              </button>
            </li>
          </ul>
        </ui-card>
      </section>
    </page-container>
  `;

  const stopCounterWatch = watch(
    computed(() => counterStore.count),
    (next, prev) => {
      const oldValue = prev ?? 0;
      lastCounterChange.value = `Counter changed from ${oldValue} to ${next}`;
    },
    { immediate: true }
  );

  const nativePlusHandler = (): void => {
    batch(() => {
      counterStore.incrementBy(5);
      counterSpring.to(counterStore.count);
    });
  };

  const delegateHandler = (_event: Event, target: Element): void => {
    const item = target.getAttribute('data-item') ?? 'unknown';
    $('#core-status').attr('data-last-item', item);
    $('#core-status').css({ color: '#4338ca', fontWeight: '600' });
    $('#core-status').text(`Delegated click on ${item}`);
  };

  $('#core-native-plus').on('click', nativePlusHandler);
  $('#core-delegate-list').delegate('click', '.delegate-item', delegateHandler);

  $('#core-status')
    .addClass('rounded')
    .addClass('px-2')
    .addClass('py-1')
    .css('background-color', '#eef2ff');
  $('#core-status').attr('data-ready', 'true');
  $('#core-status').text('Core demo ready');

  $$('.delegate-item').addClass('transition-colors');

  const view = mount(container, {
    // Counter store bindings
    count: counterStore.count,
    doubled: counterStore.doubled,
    increment: () => {
      counterStore.increment();
      counterSpring.to(counterStore.count);
    },
    decrement: () => {
      counterStore.decrement();
      counterSpring.to(counterStore.count);
    },
    reset: () => {
      batch(() => {
        counterStore.reset();
        greetingInput.value = '';
      });
      counterSpring.to(counterStore.count);
    },

    // Two-way binding demo
    greetingInput,
    readonlyGreeting,
    greetingPreview,
    hasGreeting,
    lastCounterChange,

    serializeCoreForm: () => {
      const serializedObject = $('#core-form').serialize();
      const serializedString = $('#core-form').serializeString();

      $('#core-serialized').html(`
        <pre class="overflow-auto rounded bg-gray-50 p-2 dark:bg-gray-900">
${JSON.stringify(serializedObject, null, 2)}
\n${serializedString}
        </pre>
      `);
    },

    toggleWrap: () => {
      const wrapTarget = $('#core-wrap-target');
      const parent = wrapTarget.parent();
      if (parent?.classList.contains('core-wrapper')) {
        wrapTarget.unwrap();
      } else {
        const wrapper = document.createElement('div');
        wrapper.className = 'core-wrapper rounded border border-indigo-200 p-2';
        wrapTarget.wrap(wrapper);
      }
    },

    scrollToCards: () => {
      $('#core-demo-box').scrollTo({ behavior: 'smooth', block: 'center' });
    },
  });

  const originalDestroy = view.destroy;
  view.destroy = () => {
    $('#core-native-plus').off('click', nativePlusHandler);
    $('#core-delegate-list').undelegate(
      'click',
      '.delegate-item',
      delegateHandler
    );
    stopCounterWatch();
    originalDestroy();
  };

  return view;
}
