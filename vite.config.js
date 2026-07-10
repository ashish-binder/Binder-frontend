import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  root: '.', // ensure root is current dir
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // These are only reached through a dynamic import() (the VPO "Download PDF" flow).
  // Without pre-bundling them, the first click triggers an on-the-fly dep optimisation
  // that reloads the page and aborts the in-flight import ("Failed to fetch dynamically
  // imported module").
  optimizeDeps: {
    include: ['html2canvas', 'jspdf'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  }
})
