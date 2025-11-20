import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Reporte_aguas2025v1/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
