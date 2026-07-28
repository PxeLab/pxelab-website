import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://pxelab.io',
  base: '/',
  outDir: './dist',
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
