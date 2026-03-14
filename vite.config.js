import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
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
