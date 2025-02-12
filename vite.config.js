import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Dynamically import PostCSS config if using ESM
const postcssConfig = (await import('./postcss.config.cjs')).default;

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: postcssConfig
  },
  server: {
    port: 5173,
    strictPort: true,
    open: false,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'public/dist',
    assetsDir: 'assets',
    manifest: true
  }
});