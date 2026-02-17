/**
 * @file `<ui-modal>` — Overlay modal dialog Web Component.
 *
 * Opens a centered modal with a backdrop.  Supports a title, body
 * slot, and close button.  Emits `"close"` when the user clicks the
 * backdrop, presses Escape, or clicks the close button.
 *
 * @example
 * ```html
 * <ui-modal modal-title="Confirm" open>
 *   <p>Are you sure?</p>
 * </ui-modal>
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

class UiModalElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['modal-title', 'open'];
  }

  private readonly onDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    if (!this.hasAttribute('open')) return;
    this.emitClose();
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    document.addEventListener('keydown', this.onDocumentKeydown);
    this.render();
  }

  disconnectedCallback(): void {
    document.removeEventListener('keydown', this.onDocumentKeydown);
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return;
    this.render();
  }

  private emitClose(): void {
    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private render(): void {
    try {
      if (!this.shadowRoot) return;

      const modalTitle = this.getAttribute('modal-title') ?? '';

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

          .backdrop {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
            animation: fadeIn 150ms ease;
          }
          .modal {
            background-color: #ffffff;
            border-radius: 0.75rem;
            padding: 1.5rem;
            min-width: 20rem;
            max-width: 90vw;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            animation: scaleIn 200ms ease;
            position: relative;
          }
          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
          }
          .modal-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #111827;
            margin: 0;
          }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            line-height: 1;
            padding: 0.25rem;
            border-radius: 0.25rem;
            transition: color 150ms ease;
          }
          .close-btn:hover {
            color: #111827;
          }
          .modal-body {
            color: #4b5563;
            line-height: 1.6;
          }
          :host(:not([open])) .backdrop {
            display: none;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to   { opacity: 1; transform: scale(1); }
          }

          :host(.dark) .modal {
            background-color: #1f2937;
          }
          :host(.dark) .modal-title {
            color: #f9fafb;
          }
          :host(.dark) .close-btn {
            color: #9ca3af;
          }
          :host(.dark) .close-btn:hover {
            color: #f9fafb;
          }
          :host(.dark) .modal-body {
            color: #d1d5db;
          }
        </style>

        <div class="backdrop">
          <div class="modal" role="dialog" aria-modal="true">
            <div class="modal-header">
              <h2 class="modal-title">${escapeHtml(modalTitle)}</h2>
              <button class="close-btn" aria-label="Close">&times;</button>
            </div>
            <div class="modal-body">
              <slot></slot>
            </div>
          </div>
        </div>
      `;

      const backdrop = this.shadowRoot.querySelector('.backdrop');
      const closeBtn = this.shadowRoot.querySelector('.close-btn');

      backdrop?.addEventListener('click', (event) => {
        if (event.target === backdrop) {
          this.emitClose();
        }
      });

      closeBtn?.addEventListener('click', () => {
        this.emitClose();
      });
    } catch (error) {
      reportComponentError('ui-modal', error as Error);
    }
  }
}

if (!customElements.get('ui-modal')) {
  customElements.define('ui-modal', UiModalElement);
}
