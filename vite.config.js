import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: '.',
  /** Load `VITE_*` from playground so secrets stay next to the mock host. */
  envDir: resolve(repoRoot, 'playground'),
  server: {
    port: 5173,
    open: true,
    fs: {
      allow: [repoRoot],
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'DynarisWidget',
      fileName: (format) => `dynaris-widget.${format === 'es' ? 'es' : 'umd'}.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        globals: {},
        assetFileNames: 'dynaris-widget.[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
