import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1500, // avoids warnings for large chunks
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          chart: ['chart.js', 'chartjs-plugin-datalabels', 'react-chartjs-2'],
          pdf: ['jspdf', 'jspdf-autotable', 'html2canvas'],
          state: ['react-redux', '@reduxjs/toolkit', 'redux-persist'],
          ui: ['antd', '@chakra-ui/react', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
})
