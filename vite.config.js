import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    target: 'es2020',
  },
  define: {
    'self.FIREBASE_MESSAGING_SW': false,
  },
})
