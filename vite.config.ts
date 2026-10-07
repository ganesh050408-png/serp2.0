import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleFlightSearchRequest } from './server/flightApiHandler';
import { createApp } from './server/app';

function aetheraBackendPlugin(): Plugin {
  return {
    name: 'aethera-backend-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/flights/search')) {
          await handleFlightSearchRequest(req, res);
          return;
        }
        next();
      });
      const app = createApp();
      server.middlewares.use(app);
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/flights/search')) {
          await handleFlightSearchRequest(req, res);
          return;
        }
        next();
      });
      const app = createApp();
      server.middlewares.use(app);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
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
