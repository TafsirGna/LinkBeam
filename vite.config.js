import { defineConfig } from 'vite';
const { resolve } = require('path');
import react from '@vitejs/plugin-react'

export default defineConfig({
  
  plugins: [react()],
  base: '/static/',
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
  },
  build: {
    outDir: resolve('./static/dist'),
    assetsDir: '',
    manifest: true,
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: {
      input: {
        app_css: resolve('./static/linkbeam/css/app.css'),
        app_js: resolve('./static/linkbeam/js/app.js'),
        viewer_app_js: resolve('./static/linkbeam/js/viewer/app.jsx'),
      }
    },
  },
});