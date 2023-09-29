import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        
        // web_ui: resolve(__dirname, 'src/web_ui.jsx'),
        web_ui: resolve(__dirname, 'web_ui.html'),
        tab_verifier_cs: resolve(__dirname, 'src/scripts/tab_verifier_cs.js'),
        index: resolve(__dirname, 'index.html'),
        service_worker: resolve(__dirname, 'src/scripts/service-worker.mjs'),

      },
      output: {
        // manualChunks: false,
        // inlineDynamicImports: true,
        entryFileNames: 'assets/[name].js',   // currently does not work for the legacy bundle
        assetFileNames: 'assets/[name].[ext]', // currently does not work for images
      },
    },
  },


})
