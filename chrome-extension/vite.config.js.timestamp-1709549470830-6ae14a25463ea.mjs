// vite.config.js
import { defineConfig } from "file:///home/gna/Projects/LinkBeam/chrome-extension/node_modules/vite/dist/node/index.js";
import react from "file:///home/gna/Projects/LinkBeam/chrome-extension/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "/home/gna/Projects/LinkBeam/chrome-extension";
var vite_config_default = defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        feed_data_extractor: resolve(__vite_injected_original_dirname, "src/scripts/feed_data_extractor.jsx")
      },
      output: {
        // manualChunks: false,
        // inlineDynamicImports: true,
        entryFileNames: "assets/[name].js",
        // currently does not work for the legacy bundle
        assetFileNames: "assets/[name].[ext]"
        // currently does not work for images
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9nbmEvUHJvamVjdHMvTGlua0JlYW0vY2hyb21lLWV4dGVuc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvZ25hL1Byb2plY3RzL0xpbmtCZWFtL2Nocm9tZS1leHRlbnNpb24vdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvZ25hL1Byb2plY3RzL0xpbmtCZWFtL2Nocm9tZS1leHRlbnNpb24vdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG5cbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuXG4gICAgICAgIGZlZWRfZGF0YV9leHRyYWN0b3I6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3NjcmlwdHMvZmVlZF9kYXRhX2V4dHJhY3Rvci5qc3gnKSxcblxuICAgICAgfSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBtYW51YWxDaHVua3M6IGZhbHNlLFxuICAgICAgICAvLyBpbmxpbmVEeW5hbWljSW1wb3J0czogdHJ1ZSxcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLmpzJywgICAvLyBjdXJyZW50bHkgZG9lcyBub3Qgd29yayBmb3IgdGhlIGxlZ2FjeSBidW5kbGVcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLltleHRdJywgLy8gY3VycmVudGx5IGRvZXMgbm90IHdvcmsgZm9yIGltYWdlc1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxuXG5cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNULFNBQVMsb0JBQW9CO0FBQ25WLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFGeEIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBRWpCLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxRQUVMLHFCQUFxQixRQUFRLGtDQUFXLHFDQUFxQztBQUFBLE1BRS9FO0FBQUEsTUFDQSxRQUFRO0FBQUE7QUFBQTtBQUFBLFFBR04sZ0JBQWdCO0FBQUE7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQTtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFHRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
