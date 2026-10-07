import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleFlightSearchRequest } from './server/flightApiHandler';

function aetheraBackendPlugin(): Plugin {
  return {
    name: 'aethera-flight-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/flights/search')) {
          await handleFlightSearchRequest(req, res);
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/flights/search')) {
          await handleFlightSearchRequest(req, res);
          return;
        }
        next();
      });
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
