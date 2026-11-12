import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Saat development, request ke /api/* diteruskan ke backend Express (Tugas 2-3).
// Browser hanya berbicara ke localhost:5173, sehingga tidak ada masalah CORS.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_PROXY_TARGET || 'http://localhost:3000';
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { '/api': { target, changeOrigin: true } },
    },
    preview: {
      port: 5173,
      proxy: { '/api': { target, changeOrigin: true } },
    },
  };
});
