/**
 * @file `<app-navbar>` — Main navigation bar Web Component.
 *
 * Renders a horizontal navigation bar with links, brand name,
 * dark-mode toggle, and authentication status indicator.
 * Links highlight based on the current route.
 *
 * @example
 * ```html
 * <app-navbar></app-navbar>
 * ```
 */

import { component, html, mergeStyles } from '../base/base.component';

const NAVBAR_STYLES = mergeStyles(`
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 3.5rem;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .brand {
    font-size: 1.125rem;
    font-weight: 800;
    color: #6366f1;
    text-decoration: none;
    letter-spacing: -0.025em;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .nav-links a {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    text-decoration: none;
    border-radius: 0.375rem;
    transition: background-color 150ms ease, color 150ms ease;
  }
  .nav-links a:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
  .nav-links a.active {
    background-color: #eef2ff;
    color: #6366f1;
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .theme-toggle {
    background: none;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    padding: 0.375rem 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    transition: background-color 150ms ease;
  }
  .theme-toggle:hover {
    background-color: #f3f4f6;
  }
  .user-badge {
    font-size: 0.8125rem;
    color: #6b7280;
  }
  .user-badge strong {
    color: #111827;
  }

  /* Dark mode */
  :host(.dark) nav {
    background-color: #111827;
    border-color: #1f2937;
  }
  :host(.dark) .nav-links a {
    color: #d1d5db;
  }
  :host(.dark) .nav-links a:hover {
    background-color: #1f2937;
    color: #f9fafb;
  }
  :host(.dark) .nav-links a.active {
    background-color: rgba(99, 102, 241, 0.15);
    color: #818cf8;
  }
  :host(.dark) .theme-toggle {
    border-color: #374151;
    color: #d1d5db;
  }
  :host(.dark) .theme-toggle:hover {
    background-color: #1f2937;
  }
  :host(.dark) .user-badge {
    color: #9ca3af;
  }
  :host(.dark) .user-badge strong {
    color: #f9fafb;
  }

  @media (max-width: 640px) {
    nav {
      flex-wrap: wrap;
      height: auto;
      padding: 0.75rem 1rem;
      gap: 0.5rem;
    }
    .nav-links {
      order: 3;
      width: 100%;
      justify-content: center;
    }
  }
`);

component<{
  currentPath: string;
  userName: string;
  isAuthenticated: boolean;
  isDark: boolean;
}>('app-navbar', {
  props: {
    currentPath: { type: String, default: '/' },
    userName: { type: String, default: 'Guest' },
    isAuthenticated: { type: Boolean, default: false },
    isDark: { type: Boolean, default: false },
  },
  styles: NAVBAR_STYLES,

  onError(error: Error) {
    console.error('[app-navbar] Render error:', error.message);
  },

  render({ props, emit }) {
    const path = props.currentPath;

    const isActive = (href: string): string => {
      if (href === '/') return path === '/' ? 'active' : '';
      return path.startsWith(href) ? 'active' : '';
    };

    const authLinks = props.isAuthenticated
      ? html`
          <a href="/dashboard" class="${isActive('/dashboard')}">Dashboard</a>
          <a href="/settings" class="${isActive('/settings')}">Settings</a>
        `
      : html` <a href="/login" class="${isActive('/login')}">Login</a> `;

    const themeIcon = props.isDark ? '☀️' : '🌙';

    const userBadge = props.isAuthenticated
      ? html`<span class="user-badge">
          <strong>${props.userName}</strong>
        </span>`
      : '';

    return html`
      <nav>
        <a href="/" class="brand">bQuery</a>

        <div class="nav-links">
          <a href="/" class="${isActive('/')}">Home</a>
          <a href="/about" class="${isActive('/about')}">About</a>
          ${authLinks}
        </div>

        <div class="nav-right">
          ${userBadge}
          <button
            class="theme-toggle"
            aria-label="Toggle theme"
            onclick="${() => emit('toggle-theme')}"
          >
            ${themeIcon}
          </button>
        </div>
      </nav>
    `;
  },
});
