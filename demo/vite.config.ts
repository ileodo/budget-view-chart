import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.PUBLIC_URL

export default defineConfig({
  base: base ? `${base.replace(/\/$/, '')}/` : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('/node_modules/echarts/') || id.includes('/node_modules/echarts-for-react/') || id.includes('/node_modules/zrender/')) return 'charts'
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router') || id.includes('/node_modules/scheduler/')) return 'react'
          if (id.includes('/node_modules/bootstrap') || id.includes('/node_modules/react-bootstrap/')) return 'bootstrap'
        }
      }
    }
  }
})
