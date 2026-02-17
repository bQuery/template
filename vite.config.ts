import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    minify: 'esbuild',
  },
  server: {
    port: 3000,
    open: true,
  },
});
