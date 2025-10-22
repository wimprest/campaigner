import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { tmpdir } from 'os'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    force: true
  },
  // Cache moved to system temp directory to avoid Dropbox sync conflicts
  // This fixes EBUSY errors that caused 504 responses and white screens
  // Cache location: C:\Users\[username]\AppData\Local\Temp\vite-cache-campaign (Windows)
  // or /tmp/vite-cache-campaign (Unix/Mac)
  // Changed in v0.2.1 from '.vite-cache' (in project folder)
  cacheDir: path.join(tmpdir(), 'vite-cache-campaign')
})
