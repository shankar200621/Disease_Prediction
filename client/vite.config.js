import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Root .env PORT= (Vite does not load parent .env by default). Override proxy with VITE_PROXY_TARGET. */
function readRootApiPort() {
  const envPath = resolve(__dirname, '..', '.env');
  if (!existsSync(envPath)) return '5000';
  const raw = readFileSync(envPath, 'utf8');
  const m = raw.match(/^\s*PORT\s*=\s*(\d+)\s*$/m);
  return m ? m[1] : '5000';
}

const API_PROXY_TARGET =
  process.env.VITE_PROXY_TARGET || `http://127.0.0.1:${readRootApiPort()}`;

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
});
