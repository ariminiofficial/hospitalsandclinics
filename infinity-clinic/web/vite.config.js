import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'https://clinic.arimini.in',
      '/socket.io': {
        target: 'https://clinic.arimini.in',
        ws: true,
      },
    },
  },
});
