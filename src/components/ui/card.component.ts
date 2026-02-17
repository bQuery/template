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

import {
  component,
  html,
  mergeStyles,
  reportComponentError,
} from '../base/base.component';

const CARD_STYLES = mergeStyles(`
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

  /* Dark mode support via host class */
  :host(.dark) .card {
    background-color: #1f2937;
    border-color: #374151;
  }
  :host(.dark) .card-title {
    color: #f9fafb;
  }
  :host(.dark) .card-body {
    color: #d1d5db;
  }
`);

component<{
  cardTitle: string;
  hoverable: boolean;
}>('ui-card', {
  props: {
    cardTitle: {
      type: String,
      default: '',
    },
    hoverable: {
      type: Boolean,
      default: false,
    },
  },
  styles: CARD_STYLES,

  beforeMount() {
    /* Card is about to mount. */
  },

  beforeUpdate() {
    return true;
  },

  onError(error: Error) {
    reportComponentError('ui-card', error);
  },

  render({ props }) {
    const titleHtml = props.cardTitle
      ? html`<h3 class="card-title">${props.cardTitle}</h3>`
      : '';

    return html`
      <div class="card">
        ${titleHtml}
        <div class="card-body">
          <slot></slot>
        </div>
      </div>
    `;
  },
});
