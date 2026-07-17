import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Enable CORS for Web3 wallet integration
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  build: {
    // Optimize for Web3 libraries
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['ethers'],
          animations: ['framer-motion']
        }
      }
    },
    // Increase chunk size warning limit for Web3 dependencies
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    // Define environment variables for different networks
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['ethers', 'framer-motion']
  }
})