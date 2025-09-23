// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '@/layouts': path.resolve('./src/layouts'),
        '@/pages': path.resolve('./src/pages'),
        '@/styles': path.resolve('./src/styles'),
        '@/components': path.resolve('./src/components')
      }
    }
  }
});