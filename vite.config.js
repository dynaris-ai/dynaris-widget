import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
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
