import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Esta linha garante que a pasta public seja servida
  server: {
    port: 3000,
  },
})
