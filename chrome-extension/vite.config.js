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
        // profile_data_extractor: resolve(__dirname, 'src/scripts/profile_data_extractor.jsx'),
        main_content_script: resolve(__dirname, 'src/ui_content_scripts/injected_scripts/main_script.jsx'),
        index: resolve(__dirname, 'index.html'),
        main_service_worker: resolve(__dirname, 'src/service_workers/main.mjs'),

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
