import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Ensure compatibility with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load PostCSS config dynamically with error handling
let postcssConfig = {};
try {
  postcssConfig = (await import('./postcss.config.cjs')).default;
} catch (error) {
  console.warn("⚠️ Warning: Could not load PostCSS config.", error);
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // ✅ Allows `@/lib/utils` to work
    }
  },
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