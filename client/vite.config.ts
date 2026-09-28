import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  // The client reads its own .env; VITE_* vars are the only ones exposed to the
  // browser bundle, so secrets can never leak into client code.
  loadEnv(mode, path.resolve(__dirname), '');

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        // Lets the dev client call /api on its own origin, so the browser never
        // makes a cross-origin request during development.
        '/api': {
          target: process.env['VITE_DEV_API_TARGET'] || 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      // Split the admin panel out of the public bundle so first paint for a
      // normal visitor does not download admin code.
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['motion'],
            icons: ['lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 700,
    },
  };
});
