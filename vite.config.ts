import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base must match your GitHub repo name for Pages: https://<user>.github.io/<repo-name>/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/pim-prototype/' : '/',
  plugins: [react()],
  server: {
    allowedHosts: ['.ngrok-free.dev', '.ngrok.io'],
  },
})
