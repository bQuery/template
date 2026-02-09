# bQuery Template

A template repository built with [@bquery/bquery](https://github.com/bQuery/bQuery) to build dynamic client-side apps.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Project Structure

```text
├── index.html              # App entry point
├── src/
│   ├── main.ts             # TypeScript entry – signals, DOM, events
│   ├── style.css           # Global styles
│   └── components/
│       └── greeting-card.ts # Example Web Component
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## What's Included

- **Reactive Counter** – demonstrates `signal`, `computed`, and `effect`
- **To-Do List** – reactive list with add, toggle, and remove
- **Web Component** – a `<greeting-card>` built with `component()` and `html`

## Learn More

- [bQuery.js Documentation](https://github.com/bQuery/bQuery)
- [Vite Documentation](https://vite.dev/)

## License

MIT
