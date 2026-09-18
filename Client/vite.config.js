import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
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
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui-core';
            }
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'framer-motion';
            }
            if (id.includes('recharts') || id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts';
            }
            if (id.includes('socket.io-client') || id.includes('axios')) {
              return 'network-vendor';
            }
            if (id.includes('lucide-react') || id.includes('@fortawesome')) {
              return 'icons-vendor';
            }
          }
        },
      },
    },
  },
})
