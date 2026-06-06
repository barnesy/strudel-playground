import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

// Multi-page build:
//   - controller-v2.html : the main sequencer app (loads Strudel from a CDN)
//   - index.html         : the minimal npm/ES-module example
// public/ (e.g. js/pattern-utils.js) is copied verbatim into the build output.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: resolve(root, 'controller-v2.html'),
        example: resolve(root, 'index.html'),
      },
    },
  },
});
