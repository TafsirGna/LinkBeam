import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {

        main_content_script: resolve(__dirname, 'src/ui_content_scripts/injected_scripts/main_script.jsx'),

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
