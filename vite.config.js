import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/school-vending-status/',
  plugins: [react()],
})

// Trigger redeployment: 2026-06-04T08:20:10+09:00
