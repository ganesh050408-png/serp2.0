import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleFlightSearchRequest } from './server/flightApiHandler';
import { createApp } from './server/app';

function aetheraBackendPlugin(): Plugin {
  return {
    name: 'aethera-backend-plugin',
    configureServer(server) {
      const app = createApp();
      server.middlewares.use((req, res, next) => {
        if (req.url && (req.url.startsWith('/api') || req.url.startsWith('/api/'))) {
          return app(req, res, next);
        }
        next();
      });
    },
    configurePreviewServer(server) {
      const app = createApp();
      server.middlewares.use((req, res, next) => {
        if (req.url && (req.url.startsWith('/api') || req.url.startsWith('/api/'))) {
          return app(req, res, next);
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
  },
  plugins: [react(), aetheraBackendPlugin()],
  build: {
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      output: {
        manualChunks: {
          'geo-data': ['country-state-city'],
        },
      },
    },
  },
});
