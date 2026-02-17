/**
 * @file `<page-container>` — Layout wrapper for page content.
 *
 * Provides consistent padding, max-width, and centering for every
 * page rendered inside the app shell.
 *
 * @example
 * ```html
 * <page-container>
 *   <h1>Page Title</h1>
 *   <p>Content goes here.</p>
 * </page-container>
 * ```
 */

import { component, html, mergeStyles } from '../base/base.component';

const CONTAINER_STYLES = mergeStyles(`
  .container {
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  @media (max-width: 640px) {
    .container {
      padding: 1.25rem 1rem;
    }
  }
`);

component('page-container', {
  styles: CONTAINER_STYLES,

  render() {
    return html`
      <div class="container">
        <slot></slot>
      </div>
    `;
  },
});
