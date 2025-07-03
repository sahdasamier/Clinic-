import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // Use automatic JSX runtime and disable emotion babel plugin
    jsxRuntime: 'automatic',
    babel: {
      plugins: []
    }
  })],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // Use different module format
      preserveEntrySignatures: 'strict',
      treeshake: {
        moduleSideEffects: false
      },
      output: {
        // Use format that handles circular deps better
        format: 'es',
        // Very simple chunking strategy
        manualChunks: {
          // Keep MUI and emotion completely separate from other vendors
          'vendor-ui': ['@mui/material', '@mui/system', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-charts': ['recharts'],
          'vendor-misc': ['i18next', 'react-i18next', 'i18next-browser-languagedetector']
        },
        // Ensure proper loading order
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  // More aggressive dependency optimization
  optimizeDeps: {
    // Don't pre-bundle problematic packages
    exclude: [
      '@emotion/react',
      '@emotion/styled'
    ],
    include: [
      'react', 
      'react-dom',
      '@mui/material',
      '@mui/system'
    ],
    force: true,
    esbuildOptions: {
      target: 'es2020',
      // Use different module format for esbuild
      format: 'esm'
    }
  },
  // Resolve configuration to handle modules better
  resolve: {
    // Ensure we're using the ES modules version
    conditions: ['import', 'module', 'browser', 'default'],
    mainFields: ['module', 'jsnext:main', 'jsnext']
  },
  // Define build-time constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
}) 