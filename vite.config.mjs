import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/llmsurvey/', // importante: com barra no início e fim
    plugins: [react()],
    chunkSizeWarningLimit: 1500, // aumenta limite pra 1.5 MB
})
