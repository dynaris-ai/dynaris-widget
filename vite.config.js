import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: '.',
  /** Must match `.env.example` (repo root). `playground/` alone would ignore root `.env`. */
  envDir: repoRoot,
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
