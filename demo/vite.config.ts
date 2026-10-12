import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

const base = process.env.PUBLIC_URL ?? '/budget-view-chart'

export default defineConfig({
  base: base ? `${base.replace(/\/$/, '')}/` : '/',
  plugins: [react()],
  resolve: {
    alias: {
      'budget-view-chart': resolve(__dirname, '../src/index.ts')
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    fs: {
      allow: [resolve(__dirname, '..')]
    }
  },
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
