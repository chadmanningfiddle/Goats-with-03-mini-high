import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true, // ✅ Automatically opens browser
  },
  build: {
    outDir: 'public/dist',
    assetsDir: 'assets',
    manifest: true
  }
});