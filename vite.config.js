import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
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
})