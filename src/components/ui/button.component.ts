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

import {
  component,
  html,
  mergeStyles,
  reportComponentError,
} from '../base/base.component';

/** CSS custom-property-driven button styles. */
const BUTTON_STYLES = mergeStyles(`
  :host {
    display: inline-block;
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

  /* Variants */
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
`);

component<{
  variant: string;
  label: string;
  disabled: boolean;
}>('ui-button', {
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (v: unknown) =>
        ['primary', 'secondary', 'danger', 'ghost'].includes(v as string),
    },
    label: {
      type: String,
      default: 'Button',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  styles: BUTTON_STYLES,

  beforeMount() {
    /* Button is about to mount. */
  },

  beforeUpdate() {
    return true;
  },

  connected() {
    /* Component successfully connected to DOM */
  },

  onError(error: Error) {
    reportComponentError('ui-button', error);
  },

  render({ props, emit }) {
    const cls = props.variant || 'primary';
    const isDisabled = props.disabled ? 'disabled' : '';

    return html`
      <button
        class="${cls}"
        ${isDisabled}
        onclick="${() => {
          if (!props.disabled) emit('press');
        }}"
      >
        <slot>${props.label}</slot>
      </button>
    `;
  },
});
