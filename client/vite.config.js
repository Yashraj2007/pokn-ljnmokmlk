import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
    // Server configuration
    server: {
      port: 5173,
      host: true,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🔴 Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔄 Proxying request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },

    // Path resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },

    // CSS configuration
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "./src/styles/_variables.scss";
            @import "./src/styles/_mixins.scss";
          `,
          charset: false,
        },
      },
      modules: {
        localsConvention: 'camelCase',
      },
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: command === 'serve',
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            utils: ['axios', 'lodash'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },

    // 🔥 FIXED: Environment variables for browser
    define: {
      // Make process.env available in browser
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        VITE_API_URL: env.VITE_API_URL || 'http://localhost:4000',
        VITE_API_BASE_URL: env.VITE_API_BASE_URL || 'http://localhost:4000/api',
        ...Object.keys(env).reduce((prev, key) => {
          if (key.startsWith('VITE_')) {
            prev[key] = env[key];
          }
          return prev;
        }, {})
      }),
      // Global polyfill
      global: 'globalThis',
      // Legacy app variables
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __API_URL__: JSON.stringify(env.VITE_API_URL || 'http://localhost:4000'),
    },

    // Development optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        'axios',
        'framer-motion',
      ],
    },

    // Preview configuration
    preview: {
      port: 4173,
      host: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Experimental features
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: `/${filename}` };
        } else {
          return { relative: true };
        }
      },
    },
  };
});
