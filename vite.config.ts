import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Get the repository name to use as base path for GitHub Pages
// This will be devopsCarousel if your repository is named that way
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/devopsCarousel/' : '/';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Set base path for GitHub Pages
  base: BASE_PATH,
});