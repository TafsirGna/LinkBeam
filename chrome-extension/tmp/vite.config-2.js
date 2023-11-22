import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        
        tab_verifier_cs: resolve(__dirname, 'src/scripts/tab_verifier_cs.js'),

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
