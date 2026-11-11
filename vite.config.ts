import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { IncomingMessage } from 'node:http'

function removeCorsHeaders(response: IncomingMessage) {
  for (const header of Object.keys(response.headers)) {
    if (header.toLowerCase().startsWith('access-control-')) delete response.headers[header]
  }
  const vary = response.headers.vary
  if (vary) {
    const remaining = (Array.isArray(vary) ? vary.join(',') : vary)
      .split(',').map(value => value.trim()).filter(value => value.toLowerCase() !== 'origin')
    if (remaining.length) response.headers.vary = remaining.join(', ')
    else delete response.headers.vary
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: { cors: false },
  server: {
    cors: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyRes', removeCorsHeaders)
          // Distinguish an unavailable upstream from an actual API error (500).
          proxy.prependListener('error', (_error, _request, response) => {
            if ('writeHead' in response && !response.headersSent) {
              response.writeHead(503)
              response.end()
            }
          })
        },
      },
      '/s3': {
        target: 'http://localhost:9200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3/, ''),
        configure(proxy) {
          proxy.on('proxyRes', removeCorsHeaders)
        },
      },
    },
  },
})
