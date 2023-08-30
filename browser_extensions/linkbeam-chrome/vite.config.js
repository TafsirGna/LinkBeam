import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        web_ui: resolve(__dirname, 'web_ui.html'),
        service_worker: resolve(__dirname, 'src/service-worker.mjs'),
      },
    },
  },


})
