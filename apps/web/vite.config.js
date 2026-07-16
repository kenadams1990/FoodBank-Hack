import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '$agents': path.resolve(__dirname, '../agents'),
      '$shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
