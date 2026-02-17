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

import { reportComponentError } from '../base/base.component';

const CONTAINER_TEMPLATE = /* html */ `
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
  </style>

  <div class="container">
    <slot></slot>
  </div>
`;

class PageContainerElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    try {
      if (!this.shadowRoot) return;
      this.shadowRoot.innerHTML = CONTAINER_TEMPLATE;
    } catch (error) {
      reportComponentError('page-container', error as Error);
    }
  }
}

if (!customElements.get('page-container')) {
  customElements.define('page-container', PageContainerElement);
}
