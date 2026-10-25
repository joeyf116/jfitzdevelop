import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project page lives at https://joeyf116.github.io/jfitzdevelop/.
// Set VITE_BASE=/ when serving from a custom domain or a user site.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/jfitzdevelop/',
  plugins: [react()],
  // The lazy-loaded three.js chunk is ~250 kB gzipped and expected to be large.
  build: { chunkSizeWarningLimit: 1000 },
})
