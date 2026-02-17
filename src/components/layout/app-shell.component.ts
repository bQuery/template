/**
 * @file `<app-shell>` — Root application layout.
 *
 * Wraps the entire application with the navigation bar and a main
 * content slot.  Also renders the global notification stack.
 *
 * @example
 * ```html
 * <app-shell>
 *   <div id="router-outlet"></div>
 * </app-shell>
 * ```
 */

import { reportComponentError } from '../base/base.component';

const SHELL_TEMPLATE = /* html */ `
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    :host([hidden]) {
      display: none !important;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }

    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .shell-root {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .shell-main {
      flex: 1;
    }
    .notification-stack {
      position: fixed;
      top: 4rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 100;
      pointer-events: none;
    }
    .notification-stack > * {
      pointer-events: auto;
    }
  </style>

  <div class="shell-root">
    <slot name="navbar"></slot>
    <main class="shell-main">
      <slot></slot>
    </main>
    <div class="notification-stack">
      <slot name="notifications"></slot>
    </div>
  </div>
`;

class AppShellElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    try {
      if (!this.shadowRoot) return;
      this.shadowRoot.innerHTML = SHELL_TEMPLATE;
    } catch (error) {
      reportComponentError('app-shell', error as Error);
    }
  }
}

if (!customElements.get('app-shell')) {
  customElements.define('app-shell', AppShellElement);
}
