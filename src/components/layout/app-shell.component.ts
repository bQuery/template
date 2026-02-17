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

import {
  component,
  html,
  mergeStyles,
  reportComponentError,
} from '../base/base.component';

const SHELL_STYLES = mergeStyles(`
  :host {
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
`);

component('app-shell', {
  styles: SHELL_STYLES,

  beforeMount() {
    /* Root shell is about to mount. */
  },

  beforeUpdate() {
    return true;
  },

  onError(error: Error) {
    reportComponentError('app-shell', error);
  },

  render() {
    return html`
      <slot name="navbar"></slot>
      <main class="shell-main">
        <slot></slot>
      </main>
      <div class="notification-stack">
        <slot name="notifications"></slot>
      </div>
    `;
  },
});
