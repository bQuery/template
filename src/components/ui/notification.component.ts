/**
 * @file `<ui-notification>` — Toast notification Web Component.
 *
 * Renders a single notification with an icon, message, and close
 * button.  Supports `success`, `error`, `info`, and `warning`
 * variants via the `variant` attribute.
 *
 * @example
 * ```html
 * <ui-notification variant="success" message="Saved!"></ui-notification>
 * ```
 */

import {
  component,
  html,
  mergeStyles,
  reportComponentError,
} from '../base/base.component';

const NOTIFICATION_STYLES = mergeStyles(`
  .notification {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.4;
    animation: slideIn 250ms ease;
    max-width: 24rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .icon {
    flex-shrink: 0;
    font-size: 1.125rem;
    line-height: 1;
    margin-top: 0.0625rem;
  }
  .message {
    flex: 1;
  }
  .close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.125rem;
    line-height: 1;
    padding: 0;
    opacity: 0.6;
    transition: opacity 150ms ease;
  }
  .close:hover { opacity: 1; }

  /* Variants */
  .success {
    background-color: #ecfdf5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  .error {
    background-color: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }
  .info {
    background-color: #eff6ff;
    color: #1e40af;
    border: 1px solid #bfdbfe;
  }
  .warning {
    background-color: #fffbeb;
    color: #92400e;
    border: 1px solid #fde68a;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(1rem); }
    to   { opacity: 1; transform: translateX(0); }
  }
`);

/** Map variant to its display icon. */
const ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

component<{
  variant: string;
  message: string;
}>('ui-notification', {
  props: {
    variant: {
      type: String,
      default: 'info',
      validator: (v: unknown) =>
        ['success', 'error', 'info', 'warning'].includes(v as string),
    },
    message: {
      type: String,
      required: true,
      default: '',
    },
  },
  styles: NOTIFICATION_STYLES,

  beforeMount() {
    /* Notification is about to mount. */
  },

  connected() {
    const self = this as unknown as HTMLElement;
    const handleClick = (event: Event): void => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.close')) {
        self.dispatchEvent(
          new CustomEvent('dismiss', {
            bubbles: true,
            composed: true,
          })
        );
      }
    };
    self.shadowRoot?.addEventListener('click', handleClick);
    (self as any)._handleClick = handleClick;
  },

  disconnected() {
    const self = this as unknown as HTMLElement;
    const handleClick = (self as any)._handleClick as EventListener | undefined;
    if (handleClick) {
      self.shadowRoot?.removeEventListener('click', handleClick);
    }
  },

  beforeUpdate() {
    return true;
  },

  onError(error: Error) {
    reportComponentError('ui-notification', error);
  },

  render({ props }) {
    const variant = props.variant || 'info';
    const icon = ICONS[variant] ?? ICONS.info;

    return html`
      <div class="notification ${variant}" role="alert">
        <span class="icon">${icon}</span>
        <span class="message">${props.message}</span>
        <button class="close" aria-label="Dismiss">×</button>
      </div>
    `;
  },
});
