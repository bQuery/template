# @bQuery/template

Production-ready frontend template for building single-page applications with **[bQuery.js](https://github.com/nicokempe/bquery)**, **TypeScript**, and **Tailwind CSS v4**.

This project serves as a reference implementation that demonstrates **all 9 bQuery modules** in a realistic SPA with routing, authentication, state management, animations, and web components.

## Features

- **TypeScript** strict mode — zero type errors
- **Tailwind CSS v4** with custom theme tokens and dark mode
- **6 routes** with lazy loading and code-splitting
- **8 custom web components** (buttons, cards, modals, notifications, navbar, layouts)
- **4 reactive stores** (app, auth, counter, settings — including a persisted store)
- **3 services** (storage, API, auth)
- **Navigation guards** for protected routes
- **View Transitions** for smooth page changes
- **Spring physics animations** on the counter demo
- **HTML sanitization** with XSS protection
- **Browser notification** integration
- **DRY / OOP architecture** with full JSDoc documentation

## bQuery Modules Used

| Module        | Purpose                                                                                                        | Where                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Core**      | `$()`, `$$()`, `ready()`                                                                                       | Utilities, component internals         |
| **Reactive**  | `signal()`, `computed()`, `effect()`, `batch()`                                                                | Pages, stores, main.ts                 |
| **Component** | `component()`, `html`, `safeHtml`                                                                              | 8 web components in `src/components/`  |
| **Motion**    | `spring()`, `transition()`, `springPresets`                                                                    | Page transitions, counter animation    |
| **Security**  | `sanitize()`, `escapeHtml`                                                                                     | About page, login form, sanitize utils |
| **Platform**  | `storage.local()`, `notifications`                                                                             | Auth service, settings page            |
| **Router**    | `createRouter()`, `navigate()`, `currentRoute`, `interceptLinks`                                               | Router config, guards, main.ts         |
| **Store**     | `createStore()`, `createPersistedStore()`                                                                      | 4 stores in `src/stores/`              |
| **View**      | `mount()` with `bq-text`, `bq-on`, `bq-model`, `bq-if`, `bq-for`, `bq-class`, `bq-html`, `bq-style`, `bq-bind` | All 6 pages                            |

## Project Structure

```bash
template/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite + Tailwind plugin
├── bunfig.toml                   # Bun configuration
├── public/
│   └── favicon.svg               # App icon
└── src/
    ├── main.ts                   # Application bootstrap
    ├── router.ts                 # Route definitions & guards
    ├── vite-env.d.ts             # Vite client types
    ├── styles/
    │   └── app.css               # Tailwind v4 + custom theme
    ├── types/
    │   └── index.ts              # Shared TypeScript types
    ├── services/
    │   ├── api.service.ts        # HTTP client service
    │   ├── auth.service.ts       # Authentication service
    │   └── storage.service.ts    # Local storage wrapper
    ├── stores/
    │   ├── app.store.ts          # Theme, loading, notifications
    │   ├── auth.store.ts         # User session & token
    │   ├── counter.store.ts      # Counter demo store
    │   └── settings.store.ts     # Persisted user settings
    ├── guards/
    │   └── auth.guard.ts         # Navigation guard
    ├── utils/
    │   ├── animation.utils.ts    # Motion helper functions
    │   ├── dom.utils.ts          # DOM utility functions
    │   └── sanitize.utils.ts     # Security sanitization helpers
    ├── components/
    │   ├── base/
    │   │   └── base.component.ts # Shared component utilities
    │   ├── layout/
    │   │   ├── app-shell.component.ts
    │   │   └── page-container.component.ts
    │   └── ui/
    │       ├── button.component.ts
    │       ├── card.component.ts
    │       ├── modal.component.ts
    │       ├── navbar.component.ts
    │       └── notification.component.ts
    └── pages/
        ├── home.page.ts          # Counter + two-way binding demo
        ├── about.page.ts         # Sanitization demo + tech info
        ├── dashboard.page.ts     # Task list (auth-protected)
        ├── login.page.ts         # Login form
        ├── settings.page.ts      # Persisted settings
        └── not-found.page.ts     # 404 page
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) ≥ 1.0

### Install

```bash
bun install
```

### Development

```bash
bun run dev
```

Opens the dev server at [http://localhost:3000](http://localhost:3000) with hot module replacement.

### Type Check

```bash
bun run typecheck
```

### Build

```bash
bun run build
```

Produces an optimized production build in `dist/` with code-splitting and lazy-loaded page chunks.

### Preview

```bash
bun run preview
```

Serves the production build locally.

## Architecture

### Text-Based Architecture Diagram

```text
┌───────────────────────────────────────────────────────────────────┐
│ index.html (#app)                                                 │
│  └─ <app-shell>                                                   │
│      ├─ <app-navbar>                                              │
│      ├─ Root bq-* directive bindings (global route/filter state) │
│      ├─ #router-outlet                                            │
│      │   └─ Router renders page modules                           │
│      │      ├─ Home / About / Dashboard / Login / Settings / 404 │
│      │      └─ Each page mounts local View context               │
│      └─ #notification-stack                                       │
└───────────────────────────────────────────────────────────────────┘

Data flow:
Services (API/Auth/Storage) → Stores (app/auth/counter/settings)
→ Pages/Components → View bindings (`bq-*`) → DOM

Cross-cutting concerns:
- Router + Auth Guard protect private routes
- Security sanitizes all user HTML input/output
- Motion handles transitions, springs, and FLIP list animation
- Platform handles local storage and browser notifications
```

### State Management

Stores use `createStore()` (and `createPersistedStore()` for settings) with a clear separation of **state**, **getters**, and **actions**. The store module uses a Proxy-based architecture — state properties are transparently reactive without `.value` access.

### Routing

Routes are defined in `src/router.ts` using `createRouter()`. Pages are lazy-loaded via dynamic imports for automatic code-splitting. An authentication guard protects `/dashboard` and `/settings`, redirecting unauthenticated users to `/login`.

### Components

All web components use bQuery's `component()` API with Shadow DOM, typed props with validators, and scoped styles. A shared `base.component.ts` provides common style constants and utility functions.

### Security

User-generated content is sanitized using bQuery's `sanitize()` and `escapeHtml()` functions. The about page includes an interactive demo showing how XSS payloads are neutralized.

## Module Guide (Practical Usage)

- **Core**: Used in `main.ts`, `home.page.ts`, and `dom.utils.ts` for
    selectors, chaining, delegation, wrapping, scrolling, and form
    serialization.
- **Reactive**: Used throughout stores/pages (`signal`, `computed`,
    `effect`, `batch`, `watch`, `readonly`).
- **Component**: Reusable Web Components in `src/components/**`.
- **Motion**: Route transitions, springs, and FLIP task-list animation.
- **Security**: Sanitization/escaping in about, home, and dashboard/login.
- **Platform**: Local persistence and browser notifications.
- **Router**: Route table, dynamic segments, guards, current route signal.
- **Store**: App/auth/counter/settings stores, including persisted settings.
- **View**: Declarative `bq-*` bindings in root + page templates.

## Tech Stack

| Tool                                          | Version |
| --------------------------------------------- | ------- |
| [bQuery](https://github.com/nicokempe/bquery) | 1.4.0   |
| [TypeScript](https://www.typescriptlang.org/) | 5.x     |
| [Tailwind CSS](https://tailwindcss.com/)      | 4.x     |
| [Vite](https://vite.dev/)                     | 6.x     |
| [Bun](https://bun.sh/)                        | ≥ 1.0   |

## License

MIT — see [LICENSE](./LICENSE).
