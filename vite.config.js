import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `bun run build` emits ONE self-contained file: dist/index.html
// (JS, CSS and three.js are all inlined; no network requests at runtime).
export default defineConfig({
  plugins: [viteSingleFile()],
  // Only crawl the real entry; other .html files in this folder are backups.
  optimizeDeps: { entries: ['index.html'] },
  build: {
    target: 'es2022',
    // The bundle includes three.js, so it is legitimately > 500 kB.
    chunkSizeWarningLimit: 2000,
  },
});
