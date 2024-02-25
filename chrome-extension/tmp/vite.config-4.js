import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {

        // web_ui: resolve(__dirname, 'web_ui.html'),
        install: resolve(__dirname, 'install.html'),
        profile_data_extractor: resolve(__dirname, 'src/scripts/profile_data_extractor.jsx'),
        feed_data_extractor: resolve(__dirname, 'src/scripts/feed_data_extractor.jsx'),
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
