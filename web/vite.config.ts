import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: 'react/jsx-dev-runtime', replacement: resolve(__dirname, 'src/host-jsx-dev-runtime.ts') },
      { find: 'react/jsx-runtime', replacement: resolve(__dirname, 'src/host-jsx-runtime.ts') },
      { find: 'react', replacement: resolve(__dirname, 'src/host-react.ts') },
      { find: '@', replacement: resolve(__dirname, 'src') },
    ],
  },
  build: {
    outDir: resolve(__dirname, '../dashboard/dist'),
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, 'src/plugin.tsx'),
      // Dashboard injects plugin bundles as classic <script> tags, so an ESM
      // bundle would fail before it reaches the registry call.
      formats: ['iife'],
      name: 'CharlieCockpitPlugin',
      fileName: () => 'index.js',
      cssFileName: 'style',
    },
  },
});
