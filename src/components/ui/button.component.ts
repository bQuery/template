/**
 * @file `<ui-button>` — Reusable button Web Component.
 *
 * Renders a styled button with variant support (primary, secondary,
 * danger, ghost) and optional disabled state.  Emits a `"press"`
 * custom event on click.
 *
 * @example
 * ```html
 * <ui-button variant="primary" label="Save"></ui-button>
 * <ui-button variant="danger" label="Delete" disabled></ui-button>
 * ```
 */

import { reportComponentError } from '../base/base.component';

class UiButtonElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['variant', 'label', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this._clickHandler = (): void => {
      if (this.hasAttribute('disabled')) return;
      this.dispatchEvent(
        new CustomEvent('press', {
          bubbles: true,
          composed: true,
        })
      );
    };
    this.shadowRoot
      ?.querySelector('button')
      ?.addEventListener('click', this._clickHandler);
  }

  disconnectedCallback(): void {
    if (this._clickHandler) {
      this.shadowRoot
        ?.querySelector('button')
        ?.removeEventListener('click', this._clickHandler);
    }
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return;
    this.render();
    // Re-attach event listener after re-render
    if (this._clickHandler) {
      this.shadowRoot
        ?.querySelector('button')
        ?.addEventListener('click', this._clickHandler);
    }
  }

  private _clickHandler: (() => void) | null = null;

  private render(): void {
    try {
      if (!this.shadowRoot) return;

      const variant = this.getAttribute('variant') || 'primary';
      const disabled = this.hasAttribute('disabled');
      const label = this.getAttribute('label') || 'Button';
      const allowed = ['primary', 'secondary', 'danger', 'ghost'];
      const className = allowed.includes(variant) ? variant : 'primary';

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
            box-sizing: border-box;
          }
          :host([hidden]) {
            display: none !important;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }

          button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 600;
            line-height: 1.25rem;
            border-radius: 0.5rem;
            border: 1px solid transparent;
            cursor: pointer;
            transition: background-color 150ms ease, box-shadow 150ms ease,
                        transform 100ms ease;
            font-family: inherit;
            outline: none;
          }
          button:focus-visible {
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4);
          }
          button:active:not(:disabled) {
            transform: scale(0.97);
          }
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .primary {
            background-color: #6366f1;
            color: #ffffff;
          }
          .primary:hover:not(:disabled) {
            background-color: #4f46e5;
          }

          .secondary {
            background-color: #e5e7eb;
            color: #1f2937;
          }
          .secondary:hover:not(:disabled) {
            background-color: #d1d5db;
          }

          .danger {
            background-color: #ef4444;
            color: #ffffff;
          }
          .danger:hover:not(:disabled) {
            background-color: #dc2626;
          }

          .ghost {
            background-color: transparent;
            color: #6366f1;
            border-color: #6366f1;
          }
          .ghost:hover:not(:disabled) {
            background-color: rgba(99, 102, 241, 0.08);
          }

          /* Dark mode */
          :host-context(.dark) .secondary {
            background-color: #374151;
            color: #f9fafb;
          }
          :host-context(.dark) .secondary:hover:not(:disabled) {
            background-color: #4b5563;
          }
          :host-context(.dark) .ghost {
            color: #818cf8;
            border-color: #818cf8;
          }
          :host-context(.dark) .ghost:hover:not(:disabled) {
            background-color: rgba(99, 102, 241, 0.15);
          }
        </style>

        <button class="${className}" ${disabled ? 'disabled' : ''}>
          <slot>${label}</slot>
        </button>
      `;
    } catch (error) {
      reportComponentError('ui-button', error as Error);
    }
  }
}

if (!customElements.get('ui-button')) {
  customElements.define('ui-button', UiButtonElement);
}
