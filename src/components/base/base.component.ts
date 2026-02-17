/**
 * @file Base component helper for bQuery Web Components.
 *
 * Provides shared utilities and patterns that all custom components
 * can leverage — ensuring consistency in error handling, styling, and
 * event emission across the application.
 */

import { component, html, safeHtml } from '@bquery/bquery/component';

/**
 * Re-export `component` and `html` so that concrete components can
 * import everything they need from this single base module.
 */
export { component, html, safeHtml };

/**
 * Shared base styles injected into every component's Shadow DOM.
 * Uses Tailwind-compatible utility resets.
 */
export const BASE_STYLES = `
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
`;

/**
 * Generate a scoped stylesheet string by combining the shared
 * {@link BASE_STYLES} with component-specific styles.
 *
 * @param extra - Additional CSS rules specific to the component.
 * @returns Combined CSS string ready for the `styles` property.
 *
 * @example
 * ```ts
 * component("my-el", {
 *   styles: mergeStyles(`:host { color: red; }`),
 *   render: () => html`<p>Hello</p>`,
 * });
 * ```
 */
export function mergeStyles(extra: string): string {
  return `${BASE_STYLES}\n${extra}`;
}

/**
 * Create a standard custom-event dispatch helper.
 *
 * @param element - The host element that dispatches the event.
 * @param name    - Event name (e.g. `"change"`).
 * @param detail  - Optional event payload.
 */
export function emitEvent(
  element: Element,
  name: string,
  detail?: unknown
): void {
  element.dispatchEvent(
    new CustomEvent(name, {
      bubbles: true,
      composed: true,
      detail,
    })
  );
}
