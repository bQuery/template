/**
 * @file Home page module.
 *
 * Landing page for the template app.  Demonstrates:
 * - **Reactive** signals with the counter store
 * - **View** directives (`bq-text`, `bq-on:click`, `bq-class`)
 * - **Motion** spring animations on the counter button
 * - **Component** usage of `@bquery/ui` components such as `<bq-card>`
 */

import { counterStore } from '@/stores/counter.store';
import { setPageTitle } from '@/utils/dom.utils';
import { sanitizeUserContent } from '@/utils/sanitize.utils';
import { $, $$, debounce, uid } from '@bquery/bquery/core';
import {
  animate,
  keyframePresets,
  spring,
  springPresets,
} from '@bquery/bquery/motion';
import { notifications, storage } from '@bquery/bquery/platform';
import {
  batch,
  computed,
  effect,
  isComputed,
  isSignal,
  persistedSignal,
  readonly,
  signal,
  watch,
} from '@bquery/bquery/reactive';
import { currentRoute, navigate } from '@bquery/bquery/router';
import { escapeHtml, sanitize, stripTags } from '@bquery/bquery/security';
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

  // Counter computeds (moved up for use in effects)
  const count = computed(() => counterStore.count);
  const doubled = computed(() => counterStore.doubled);

  // ── Reactive Playground ──
  const effectLog = signal('Waiting for counter changes…');
  const stopEffect = effect(() => {
    effectLog.value = `Effect fired! Counter = ${count.value}, Doubled = ${doubled.value}`;
  });
  const persistedNote = persistedSignal('playground-note', '');
  const typeGuardInfo = [
    `isSignal(signal) = ${isSignal(greetingInput)}`,
    `isComputed(computed) = ${isComputed(doubled)}`,
    `isSignal("hello") = ${isSignal('hello' as unknown)}`,
  ].join(' | ');

  // ── View Playground ──
  const showDemo = signal(true);
  const dynamicColor = signal('#4f46e5');
  const dynamicSize = signal('18');
  const fruits = signal([
    { name: 'Apple', emoji: '🍎' },
    { name: 'Banana', emoji: '🍌' },
    { name: 'Cherry', emoji: '🍒' },
    { name: 'Grape', emoji: '🍇' },
  ]);

  // ── Security Playground ──
  const sanitizeInput = signal('<img onerror="alert(1)" src=x> <b>Hello</b>');
  const sanitizeResult = computed(() => sanitize(sanitizeInput.value));
  const escapeResult = computed(() => escapeHtml(sanitizeInput.value));
  const stripResult = computed(() => stripTags(sanitizeInput.value));

  // ── Platform Playground ──
  const storageKey = signal('demo-key');
  const storageValue = signal('Hello bQuery!');
  const storageResult = signal('No storage operations yet.');
  const notificationStatus = signal('Click to send a browser notification.');

  // ── Store Playground ──
  const storeLog = signal(
    'Use the buttons to interact with the counter store.'
  );

  // ── Router Playground ──
  const currentPath = computed(() => currentRoute.value.path);
  const currentQuery = computed(() => JSON.stringify(currentRoute.value.query));

  // ── Motion Playground ──
  const playgroundSpring = spring(10, springPresets.snappy);

  // Sync spring to counter value
  counterSpring.onChange(() => {
    /* Spring value updated — used purely for visual feedback */
  });

  container.innerHTML = /* html */ `
    <div class="page-container">
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
        <bq-card title="Reactive Counter">
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
        </bq-card>
      </section>

      <!-- Two-Way Binding Demo -->
      <section class="mb-12">
        <bq-card title="Two-Way Binding Demo">
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
        </bq-card>
      </section>

      <!-- Module Overview Cards -->
      <section>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Core Modules
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <bq-card title="⚡ Reactive">
            <p>Signals, computed values, effects, and batched updates for fine-grained reactivity.</p>
          </bq-card>
          <bq-card title="🧩 Components">
            <p>Web Components with Shadow DOM, props validation, and lifecycle hooks.</p>
          </bq-card>
          <bq-card title="🛣️ Router">
            <p>SPA router with history API, dynamic segments, guards, and reactive route state.</p>
          </bq-card>
          <bq-card title="📦 Store">
            <p>Signal-based state management with getters, actions, and optional persistence.</p>
          </bq-card>
          <bq-card title="🎬 Motion">
            <p>View Transitions, spring physics, FLIP animations, timelines, and scroll animations.</p>
          </bq-card>
          <bq-card title="🔒 Security">
            <p>HTML sanitization, XSS protection, CSP helpers, and Trusted Types support.</p>
          </bq-card>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════
           bQuery API Playground — All Modules
           ═══════════════════════════════════════════════ -->
      <section id="playground-section" class="mt-12 space-y-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center">
          API Playground
        </h2>
        <p class="text-center text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm">
          Interactive demos for every bQuery module. Each section is fully functional — try it!
        </p>

        <!-- ──────── 1. Core API ──────── -->
        <bq-card title="🔧 Core — Selectors, DOM & Events">
          <div class="space-y-5 text-sm">
            <div id="core-demo-box" class="rounded border border-dashed border-indigo-300 dark:border-indigo-700 p-3">
              <p id="core-status" class="dark:text-gray-300">Core demo booting…</p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Event Delegation</h3>
              <ul id="core-delegate-list" class="flex gap-2 text-xs mb-2">
                <li><button class="delegate-item rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1" data-item="A">Item A</button></li>
                <li><button class="delegate-item rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1" data-item="B">Item B</button></li>
                <li><button class="delegate-item rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1" data-item="C">Item C</button></li>
              </ul>
              <p id="delegate-result" class="text-xs text-gray-400 dark:text-gray-500">Click a delegated item above.</p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">DOM Manipulation — wrap() / unwrap()</h3>
              <div class="flex gap-2 mb-2">
                <button type="button" bq-on:click="toggleWrap" class="rounded border border-indigo-500 dark:border-indigo-400 px-3 py-1 text-indigo-600 dark:text-indigo-400 text-xs">Toggle Wrap</button>
                <button type="button" bq-on:click="scrollToPlayground" class="rounded border border-indigo-500 dark:border-indigo-400 px-3 py-1 text-indigo-600 dark:text-indigo-400 text-xs">Scroll to Top ↑</button>
              </div>
              <p id="core-wrap-target" class="rounded bg-indigo-50 dark:bg-indigo-900/30 p-2 dark:text-gray-300">Wrap / unwrap target</p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Form Serialization</h3>
              <form id="core-form" class="grid gap-2 sm:grid-cols-2">
                <input type="text" name="firstName" placeholder="First name" class="rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 text-xs" />
                <input type="email" name="email" placeholder="Email" class="rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 text-xs" />
                <button type="button" bq-on:click="serializeCoreForm" class="rounded bg-indigo-600 px-3 py-1 text-white text-xs">serialize()</button>
                <button type="button" bq-on:click="serializeCoreString" class="rounded bg-indigo-600 px-3 py-1 text-white text-xs">serializeString()</button>
              </form>
              <div id="core-serialized" class="mt-2 text-xs"></div>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Utilities</h3>
              <div class="flex gap-2 flex-wrap">
                <button type="button" bq-on:click="generateUid" class="rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 text-xs">uid()</button>
                <button type="button" bq-on:click="demoDebounce" class="rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 text-xs">debounce()</button>
              </div>
              <p id="util-output" class="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono"></p>
            </div>
          </div>
        </bq-card>

        <!-- ──────── 2. Reactive ──────── -->
        <bq-card title="⚡ Reactive — Signals, Effects & Watch">
          <div class="space-y-5 text-sm">
            <p class="text-gray-500 dark:text-gray-400">
              The counter above uses signal(), computed(), batch(), and watch(). Additional reactive features:
            </p>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">effect() — Live Tracking</h3>
              <p class="text-xs text-gray-400 mb-1">Updates automatically when the counter changes:</p>
              <p bq-text="effectLog" class="font-mono text-xs p-2 rounded bg-gray-50 dark:bg-gray-900 dark:text-gray-300"></p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">watch() — Old → New</h3>
              <p class="text-xs text-gray-400 mb-1">Tracks previous and current counter value:</p>
              <p bq-text="lastCounterChange" class="font-mono text-xs p-2 rounded bg-gray-50 dark:bg-gray-900 dark:text-gray-300"></p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">persistedSignal()</h3>
              <input type="text" bq-model="persistedNote" placeholder="Type here — persisted to localStorage…"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xs" />
              <p class="text-xs text-gray-400 mt-1">This value survives page reloads via persistedSignal().</p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">isSignal() / isComputed()</h3>
              <p bq-text="typeGuardInfo" class="font-mono text-xs p-2 rounded bg-gray-50 dark:bg-gray-900 dark:text-gray-300"></p>
            </div>
          </div>
        </bq-card>

        <!-- ──────── 3. View Directives ──────── -->
        <bq-card title="📋 View — Declarative Directives">
          <div class="space-y-5 text-sm">
            <p class="text-gray-500 dark:text-gray-400">
              bq-text, bq-html, bq-model, and bq-if are demonstrated above. More directives:
            </p>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">bq-show — Toggle Visibility</h3>
              <button type="button" bq-on:click="toggleShow" class="rounded bg-indigo-600 px-3 py-1 text-white text-xs mb-2">Toggle bq-show</button>
              <p bq-show="showDemo" class="p-2 rounded bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300">
                👋 I'm visible! (bq-show toggles display: none)
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">bq-style — Dynamic Inline Styles</h3>
              <div class="flex items-center gap-3 mb-2">
                <label class="text-xs text-gray-500">Color:</label>
                <input type="color" bq-model="dynamicColor" class="w-8 h-8 rounded cursor-pointer" />
                <label class="text-xs text-gray-500">Size:</label>
                <input type="range" min="12" max="36" bq-model="dynamicSize" class="w-32" />
                <span bq-text="dynamicSize" class="text-xs text-gray-400"></span><span class="text-xs text-gray-400">px</span>
              </div>
              <p bq-style="{ color: dynamicColor, fontSize: dynamicSize + 'px' }" class="p-2 rounded bg-gray-50 dark:bg-gray-900 font-semibold">
                Styled dynamically via bq-style
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">bq-for — List with Index &amp; :key</h3>
              <ul class="space-y-1 mb-2">
                <li bq-for="(fruit, idx) in fruits" :key="fruit.name" class="flex items-center gap-2 p-1 rounded bg-gray-50 dark:bg-gray-800 dark:text-gray-300 text-xs">
                  <span class="font-mono text-gray-400 w-5" bq-text="idx + 1"></span>
                  <span bq-text="fruit.emoji"></span>
                  <span bq-text="fruit.name"></span>
                </li>
              </ul>
              <button type="button" bq-on:click="shuffleFruits" class="rounded bg-indigo-600 px-3 py-1 text-white text-xs">Shuffle List</button>
            </div>
          </div>
        </bq-card>

        <!-- ──────── 4. Motion ──────── -->
        <bq-card title="🎬 Motion — Animations & Springs">
          <div class="space-y-5 text-sm">
            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">animate() with keyframePresets</h3>
              <div class="flex gap-2 flex-wrap mb-3">
                <button type="button" bq-on:click="animatePop" class="rounded bg-purple-600 px-3 py-1 text-white text-xs">pop()</button>
                <button type="button" bq-on:click="animateFadeIn" class="rounded bg-purple-600 px-3 py-1 text-white text-xs">fadeIn()</button>
                <button type="button" bq-on:click="animateSlideIn" class="rounded bg-purple-600 px-3 py-1 text-white text-xs">slideInUp()</button>
              </div>
              <div id="motion-target" class="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center font-bold">
                Animate me!
              </div>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">spring() — Physics-Based</h3>
              <p class="text-xs text-gray-400 mb-2">Uses springPresets.snappy for physics-based animation:</p>
              <div class="flex gap-2 mb-2">
                <button type="button" bq-on:click="springRight" class="rounded bg-indigo-600 px-3 py-1 text-white text-xs">→ 90%</button>
                <button type="button" bq-on:click="springLeft" class="rounded bg-indigo-600 px-3 py-1 text-white text-xs">← 10%</button>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div id="spring-bar" class="bg-indigo-500 h-4 rounded-full" style="width: 10%"></div>
              </div>
            </div>
          </div>
        </bq-card>

        <!-- ──────── 5. Security ──────── -->
        <bq-card title="🔒 Security — Sanitization & Escaping">
          <div class="space-y-4 text-sm">
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Enter HTML to process:</label>
              <input type="text" bq-model="sanitizeInput"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xs font-mono" />
            </div>
            <div class="grid sm:grid-cols-3 gap-3">
              <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">sanitize()</p>
                <p bq-text="sanitizeResult" class="text-xs break-all dark:text-gray-300 font-mono"></p>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">escapeHtml()</p>
                <p bq-text="escapeResult" class="text-xs break-all dark:text-gray-300 font-mono"></p>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">stripTags()</p>
                <p bq-text="stripResult" class="text-xs break-all dark:text-gray-300 font-mono"></p>
              </div>
            </div>
          </div>
        </bq-card>

        <!-- ──────── 6. Platform ──────── -->
        <bq-card title="🌐 Platform — Storage & Notifications">
          <div class="space-y-5 text-sm">
            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">storage.local() — Key/Value</h3>
              <div class="flex gap-2 flex-wrap mb-2">
                <input type="text" bq-model="storageKey" placeholder="Key"
                  class="w-28 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs" />
                <input type="text" bq-model="storageValue" placeholder="Value"
                  class="flex-1 min-w-[8rem] px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs" />
                <button type="button" bq-on:click="storageSave" class="rounded bg-emerald-600 px-3 py-1 text-white text-xs">Save</button>
                <button type="button" bq-on:click="storageLoad" class="rounded bg-blue-600 px-3 py-1 text-white text-xs">Load</button>
              </div>
              <p bq-text="storageResult" class="text-xs text-gray-500 dark:text-gray-400 font-mono"></p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">notifications — Browser API</h3>
              <button type="button" bq-on:click="sendNotification" class="rounded bg-orange-600 px-3 py-1 text-white text-xs">Request &amp; Send</button>
              <p bq-text="notificationStatus" class="text-xs text-gray-500 dark:text-gray-400 mt-1"></p>
            </div>
          </div>
        </bq-card>

        <!-- ──────── 7. Store ──────── -->
        <bq-card title="📦 Store — State Management">
          <div class="space-y-4 text-sm">
            <p class="text-gray-500 dark:text-gray-400">
              The counter uses createStore(). Interact with store methods:
            </p>
            <div class="flex gap-2 flex-wrap">
              <button type="button" bq-on:click="storeReset" class="rounded bg-red-600 px-3 py-1 text-white text-xs">$reset()</button>
              <button type="button" bq-on:click="storePatch" class="rounded bg-amber-600 px-3 py-1 text-white text-xs">$patch({ count: 42 })</button>
              <button type="button" bq-on:click="storeSnapshot" class="rounded bg-sky-600 px-3 py-1 text-white text-xs">$state snapshot</button>
            </div>
            <p bq-text="storeLog" class="font-mono text-xs p-2 rounded bg-gray-50 dark:bg-gray-900 dark:text-gray-300"></p>
          </div>
        </bq-card>

        <!-- ──────── 8. Router ──────── -->
        <bq-card title="🛣️ Router — SPA Navigation">
          <div class="space-y-4 text-sm">
            <p class="text-gray-500 dark:text-gray-400">
              The app uses createRouter() with lazy-loaded pages, guards, and view transitions.
            </p>
            <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded font-mono text-xs space-y-1">
              <p class="dark:text-gray-300"><span class="text-gray-500">path:</span> <span bq-text="currentPath" class="text-indigo-600 dark:text-indigo-400"></span></p>
              <p class="dark:text-gray-300"><span class="text-gray-500">query:</span> <span bq-text="currentQuery" class="text-indigo-600 dark:text-indigo-400"></span></p>
            </div>
            <div class="flex gap-2 flex-wrap">
              <button type="button" bq-on:click="navAbout" class="rounded bg-indigo-600 px-3 py-1 text-white text-xs">navigate('/about')</button>
              <button type="button" bq-on:click="navSettings" class="rounded bg-indigo-600 px-3 py-1 text-white text-xs">navigate('/settings')</button>
            </div>
          </div>
        </bq-card>

        <!-- ──────── 9. Components ──────── -->
        <bq-card title="🧩 Components — Web Components">
          <div class="space-y-3 text-sm">
            <p class="text-gray-500 dark:text-gray-400">
              The template now pulls its reusable UI primitives from
              <code>@bquery/ui</code>, which registers <code>bq-*</code>
              Web Components via import side effects.
            </p>
            <div class="grid sm:grid-cols-2 gap-2 text-xs font-mono">
              <div class="p-2 bg-gray-50 dark:bg-gray-900 dark:text-gray-300 rounded">&lt;bq-card title="..."&gt;</div>
              <div class="p-2 bg-gray-50 dark:bg-gray-900 dark:text-gray-300 rounded">&lt;bq-button variant="primary"&gt;</div>
              <div class="p-2 bg-gray-50 dark:bg-gray-900 dark:text-gray-300 rounded">&lt;bq-dialog open&gt;</div>
              <div class="p-2 bg-gray-50 dark:bg-gray-900 dark:text-gray-300 rounded">import '@bquery/ui'</div>
            </div>
            <p class="text-xs text-gray-400">
              Components are imported once and then used as framework-agnostic custom elements alongside bQuery view directives and stores.
            </p>
          </div>
        </bq-card>
      </section>
    </div>
  `;

  // ── Imperative Core API Setup ──
  const stopCounterWatch = watch(
    count,
    (next, prev) => {
      const oldValue = prev ?? 0;
      lastCounterChange.value = `${oldValue} → ${next}`;
    },
    { immediate: true }
  );

  const delegateHandler = (_event: Event, target: Element): void => {
    const item = target.getAttribute('data-item') ?? 'unknown';
    $('#core-status').attr('data-last-item', item);
    $('#core-status').css({ color: '#4338ca', fontWeight: '600' });
    $('#core-status').text(`Delegated click on Item ${item}`);
    $('#delegate-result').text(`Last delegation: Item ${item}`);
  };

  $('#core-delegate-list').delegate('click', '.delegate-item', delegateHandler);

  $('#core-status')
    .addClass('rounded', 'px-2', 'py-1')
    .css('background-color', '#eef2ff');
  $('#core-status').attr('data-ready', 'true');
  $('#core-status').text('Core demo ready ✓');

  $$('.delegate-item').addClass(
    'transition-colors',
    'hover:bg-gray-200',
    'dark:hover:bg-gray-600',
    'cursor-pointer'
  );

  // Spring bar animation callback
  playgroundSpring.onChange((v: number) => {
    const bar = document.getElementById('spring-bar');
    if (bar) bar.style.width = `${v}%`;
  });

  // Debounce helper for utility demo
  const debouncedLog = debounce(() => {
    const el = document.getElementById('util-output');
    if (el)
      el.textContent = `Debounced! Fired at ${new Date().toLocaleTimeString()}`;
  }, 800);

  const view = mount(container, {
    // ── Counter bindings ──
    count,
    doubled,
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

    // ── Two-way binding ──
    greetingInput,
    readonlyGreeting,
    greetingPreview,
    hasGreeting,

    // ── Reactive Playground ──
    effectLog,
    lastCounterChange,
    persistedNote,
    typeGuardInfo,

    // ── View Playground ──
    showDemo,
    dynamicColor,
    dynamicSize,
    fruits,
    toggleShow: () => {
      showDemo.value = !showDemo.value;
    },
    shuffleFruits: () => {
      const arr = [...fruits.value];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      fruits.value = arr;
    },

    // ── Core Playground ──
    serializeCoreForm: () => {
      const data = $('#core-form').serialize();
      $('#core-serialized').htmlUnsafe(
        `<pre class="overflow-auto rounded bg-gray-50 dark:bg-gray-900 dark:text-gray-300 p-2 text-xs font-mono">${JSON.stringify(data, null, 2)}</pre>`
      );
    },
    serializeCoreString: () => {
      const qs = $('#core-form').serializeString();
      $('#core-serialized').htmlUnsafe(
        `<pre class="overflow-auto rounded bg-gray-50 dark:bg-gray-900 dark:text-gray-300 p-2 text-xs font-mono">${qs}</pre>`
      );
    },
    toggleWrap: () => {
      const target = $('#core-wrap-target');
      const parent = target.parent();
      if (parent?.classList.contains('core-wrapper')) {
        target.unwrap();
      } else {
        const wrapper = document.createElement('div');
        wrapper.className =
          'core-wrapper rounded border-2 border-dashed border-indigo-400 p-3';
        target.wrap(wrapper);
      }
    },
    scrollToPlayground: () => {
      document
        .getElementById('playground-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    generateUid: () => {
      const id = uid('bq');
      const el = document.getElementById('util-output');
      if (el) el.textContent = `uid("bq") → ${id}`;
    },
    demoDebounce: () => {
      debouncedLog();
      const el = document.getElementById('util-output');
      if (el) el.textContent = 'Debouncing… (wait 800ms)';
    },

    // ── Motion Playground ──
    animatePop: () => {
      const el = document.getElementById('motion-target');
      if (el)
        animate(el, {
          keyframes: keyframePresets.pop(),
          options: { duration: 400, easing: 'ease-out' },
        });
    },
    animateFadeIn: () => {
      const el = document.getElementById('motion-target');
      if (el)
        animate(el, {
          keyframes: keyframePresets.fadeIn(),
          options: { duration: 500, easing: 'ease-out' },
        });
    },
    animateSlideIn: () => {
      const el = document.getElementById('motion-target');
      if (el)
        animate(el, {
          keyframes: keyframePresets.slideInUp(),
          options: { duration: 500, easing: 'ease-out' },
        });
    },
    springRight: () => {
      playgroundSpring.to(90);
    },
    springLeft: () => {
      playgroundSpring.to(10);
    },

    // ── Security Playground ──
    sanitizeInput,
    sanitizeResult,
    escapeResult,
    stripResult,

    // ── Platform Playground ──
    storageKey,
    storageValue,
    storageResult,
    notificationStatus,
    storageSave: async () => {
      try {
        const ls = storage.local();
        await ls.set(storageKey.value, storageValue.value);
        storageResult.value = `✅ Saved "${storageKey.value}" = "${storageValue.value}"`;
      } catch {
        storageResult.value = '⚠️ Storage error.';
      }
    },
    storageLoad: async () => {
      try {
        const ls = storage.local();
        const val = await ls.get<string>(storageKey.value);
        storageResult.value =
          val !== null
            ? `📖 "${storageKey.value}" = "${val}"`
            : `❌ Key "${storageKey.value}" not found.`;
      } catch {
        storageResult.value = '⚠️ Storage error.';
      }
    },
    sendNotification: async () => {
      try {
        if (!notifications.isSupported()) {
          notificationStatus.value = '⚠️ Notifications not supported.';
          return;
        }
        const perm = await notifications.requestPermission();
        if (perm === 'granted') {
          notifications.send('bQuery Playground', {
            body: 'Hello from the Platform module!',
          });
          notificationStatus.value = '✅ Notification sent!';
        } else {
          notificationStatus.value = '❌ Permission denied.';
        }
      } catch {
        notificationStatus.value = '⚠️ Notification error.';
      }
    },

    // ── Store Playground ──
    storeLog,
    storeReset: () => {
      counterStore.$reset();
      storeLog.value = `$reset() → count is now ${counterStore.count}`;
    },
    storePatch: () => {
      counterStore.$patch({ count: 42 });
      storeLog.value = `$patch({ count: 42 }) → count is now ${counterStore.count}`;
    },
    storeSnapshot: () => {
      storeLog.value = `$state → ${JSON.stringify(counterStore.$state)}`;
    },

    // ── Router Playground ──
    currentPath,
    currentQuery,
    navAbout: () => {
      navigate('/about');
    },
    navSettings: () => {
      navigate('/settings');
    },
  });

  const originalDestroy = view.destroy;
  view.destroy = () => {
    $('#core-delegate-list').undelegate(
      'click',
      '.delegate-item',
      delegateHandler
    );
    stopCounterWatch();
    stopEffect();
    debouncedLog.cancel();
    originalDestroy();
  };

  return view;
}
