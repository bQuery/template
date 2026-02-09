import { component, html } from '@bquery/bquery';

component('greeting-card', {
  props: {
    name: { type: String, default: 'World' },
  },
  styles: `
    :host {
      display: block;
    }
    .card {
      background: #1a1a2e;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
    }
    .card h3 {
      color: #6366f1;
      margin-bottom: 0.5rem;
    }
    .card p {
      color: #a1a1aa;
    }
  `,
  render({ props }) {
    return html`
      <div class="card">
        <h3>Hello, ${props.name}!</h3>
        <p>This is a bQuery Web Component.</p>
      </div>
    `;
  },
});
