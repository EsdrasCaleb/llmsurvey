import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/llm-tests/', // importante: com barra no início e fim
  plugins: [react()],
})
