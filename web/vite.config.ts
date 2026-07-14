import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    outDir: resolve(__dirname, '../dashboard/dist'),
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, 'src/plugin.tsx'),
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'style',
    },
    rollupOptions: {
      // React is supplied by the Hermes Dashboard host; it must not be bundled.
      external: ['react', 'react/jsx-runtime'],
      output: {
        globals: { react: 'React' },
      },
    },
  },
});
