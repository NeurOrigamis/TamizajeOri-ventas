import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/TamizajeOri-ventas/',   // 👈 nombre exacto del repositorio en GitHub
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'docs',               // 👈 carpeta que GitHub Pages servirá
  },
})
