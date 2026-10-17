import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        { find: 'firebase/firestore', replacement: path.resolve(__dirname, 'src/safety/guardedFirestore.ts') },
      ],
    },
    optimizeDeps: {
      include: ['bidi-js', 'arabic-persian-reshaper'],
    },
    define: {
      __AYSED_ALLOW_PROD_WRITES__: JSON.stringify(process.env.ALLOW_PROD_WRITES === 'true'),
      __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN || ''),
      __AYSED_NODE_ENV__: JSON.stringify(process.env.NODE_ENV || ''),
      __AYSED_VERCEL__: JSON.stringify(process.env.VERCEL || ''),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 5000,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-hot-toast'],
            'vendor-icons': ['lucide-react'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-pdf': ['pdf-lib', 'pdfjs-dist'],
            'vendor-data': ['xlsx', 'papaparse', 'recharts'],
            'vendor-ui': ['html2canvas-pro', 'motion'],
            'vendor-ocr': ['@google/genai', 'jsqr', 'qrcode']
          }
        }
      }
    },
    server: {
      port: Number(process.env.PORT) || 3000,
      strictPort: false,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
