import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Increase chunk size limit to 1000 kB
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@mui')) {
              return 'mui';
            }
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            return 'vendor-misc';
          }
          
          // Split large feature pages
          if (id.includes('src/features/dashboard/')) {
            return 'features-dashboard';
          }
          if (id.includes('src/features/appointments/')) {
            return 'features-appointments';
          }
          if (id.includes('src/features/patients/')) {
            return 'features-patients';
          }
          if (id.includes('src/features/payments/')) {
            return 'features-payments';
          }
          if (id.includes('src/features/admin/') || id.includes('src/features/auth/')) {
            return 'features-admin';
          }
        }
      }
    }
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