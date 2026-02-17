/**
 * @file `<ui-card>` — Content card Web Component.
 *
 * Displays a bordered card with an optional title and body slot.
 * Supports a `hoverable` attribute that adds a lift effect on hover
 * using bQuery spring animations.
 *
 * @example
 * ```html
 * <ui-card card-title="Features" hoverable>
 *   <p>Card body content here.</p>
 * </ui-card>
 * ```
 */

import { reportComponentError } from '../base/base.component';

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;');

class UiCardElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['card-title', 'hoverable'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return;
    this.render();
  }

  private render(): void {
    try {
      if (!this.shadowRoot) return;

      const cardTitle = this.getAttribute('card-title') ?? '';
      const titleHtml = cardTitle
        ? `<h3 class="card-title">${escapeHtml(cardTitle)}</h3>`
        : '';

      this.shadowRoot.innerHTML = `
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

          .card {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            padding: 1.5rem;
            transition: box-shadow 200ms ease, transform 200ms ease;
          }
          :host([hoverable]) .card:hover {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                        0 4px 6px -2px rgba(0, 0, 0, 0.05);
            transform: translateY(-2px);
          }
          .card-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: #111827;
            margin: 0 0 0.75rem;
            line-height: 1.4;
          }
          .card-body {
            color: #4b5563;
            font-size: 0.9375rem;
            line-height: 1.6;
          }

          :host-context(.dark) .card {
            background-color: #1f2937;
            border-color: #374151;
          }
          :host-context(.dark) .card-title {
            color: #f9fafb;
          }
          :host-context(.dark) .card-body {
            color: #d1d5db;
          }
        </style>

        <div class="card">
          ${titleHtml}
          <div class="card-body">
            <slot></slot>
          </div>
        </div>
      `;
    } catch (error) {
      reportComponentError('ui-card', error as Error);
    }
  }
}

if (!customElements.get('ui-card')) {
  customElements.define('ui-card', UiCardElement);
}
