import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/TamizajeOri-ventas/',  // 👈 pon aquí el nombre exacto del repo
  plugins: [react()],
  build: { outDir: 'docs' }
})
