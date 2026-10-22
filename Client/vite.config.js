import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = env.VITE_IS_PRODUCTION === 'true' || mode === 'production';

  return {
    plugins: [
      react(),
      {
        name: 'chrome-devtools-well-known',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.includes('/.well-known/appspecific/com.chrome.devtools.json')) {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = 200;
              res.end(JSON.stringify({}));
              return;
            }
            next();
          });
        },
      },
    ],

    server: {
      host: true,
      port: 5173,
      proxy: {
        '/u': 'http://127.0.0.1:9000',
        '/products': {
          target: 'http://127.0.0.1:9000',
          bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
        },
        '/order': {
          target: 'http://127.0.0.1:9000',
          bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
        },
        '/user-profile': {
          target: 'http://127.0.0.1:9000',
          bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
        },
        '/admin': {
          target: 'http://127.0.0.1:9000',
          bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
        },
        '/admin-profile': 'http://127.0.0.1:9000',
        '/payment': {
          target: 'http://127.0.0.1:9000',
          bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
        },
        '/store': {
          target: 'http://127.0.0.1:9000',
          bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
        },
        '/pdf': 'http://127.0.0.1:9000',
        '/page-content': 'http://127.0.0.1:9000',
        '/api': 'http://127.0.0.1:9000',
        '/enquiry': 'http://127.0.0.1:9000',
        '/notifications': 'http://127.0.0.1:9000',
        '/uploads': 'http://127.0.0.1:9000',
        '/socket.io': {
          target: 'http://127.0.0.1:9000',
          ws: true,
        },
      },
    },

  // Pre-bundle heavy deps so dev server starts fast
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'axios',
      'notistack',
      '@mui/material',
      '@mui/icons-material',
      'recharts',
      'socket.io-client',
    ],
  },

  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    minify: 'esbuild',
  },
};
});
