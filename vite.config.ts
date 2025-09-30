import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/TamizajeOri-ventas/',  // 👈 pon aquí el nombre exacto de tu repo en GitHub
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'docs',  // 👈 para que GitHub Pages sirva desde /docs
  },
})
