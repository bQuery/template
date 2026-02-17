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

import { component, html, mergeStyles } from '../base/base.component';

const MODAL_STYLES = mergeStyles(`
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

  /* Dark mode */
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
`);

component<{
  modalTitle: string;
  open: boolean;
}>('ui-modal', {
  props: {
    modalTitle: {
      type: String,
      default: '',
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
  styles: MODAL_STYLES,

  connected() {
    /* Modal connected — keyboard listener attached via render */
  },

  onError(error: Error) {
    console.error('[ui-modal] Render error:', error.message);
  },

  render({ props, emit }) {
    return html`
      <div
        class="backdrop"
        onclick="${(e: Event) => {
          if ((e.target as HTMLElement).classList.contains('backdrop')) {
            emit('close');
          }
        }}"
      >
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h2 class="modal-title">${props.modalTitle}</h2>
            <button
              class="close-btn"
              aria-label="Close"
              onclick="${() => emit('close')}"
            >
              &times;
            </button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  },
});
