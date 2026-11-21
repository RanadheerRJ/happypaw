/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * The deploy base path is read from VITE_BASE_PATH so the same build works at
 * `/` (local preview) and at `/<repo-name>/` (GitHub Pages project site).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            query: ['@tanstack/react-query'],
            charts: ['recharts'],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      // Preview host is <port>-<sandbox>.e2b.app — allow any host in dev.
      allowedHosts: true,
    },
    preview: { host: '0.0.0.0', port: 4173, allowedHosts: true },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
});
