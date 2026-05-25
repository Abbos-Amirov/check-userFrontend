import express from 'express'
import next from 'next'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const PORT = Number(process.env.PORT) || 3000
const HOST = process.env.HOST || '0.0.0.0'
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'http://127.0.0.1:5000'

const nextApp = next({ dev: false, dir: root })
const handle = nextApp.getRequestHandler()

await nextApp.prepare()

const app = express()

/**
 * /uploads → backend (admin panel bilan bir xil)
 */
app.use(
  '/uploads',
  createProxyMiddleware({
    target: API_PROXY_TARGET,
    changeOrigin: true,
  })
)

/**
 * /api → Next.js App Router API route'lari (BFF).
 *
 * Admin (Vite) SPA da Express to'g'ridan-to'g'ri proxy qiladi:
 *   app.use('/api', createProxyMiddleware({
 *     target: API_PROXY_TARGET,
 *     changeOrigin: true,
 *     pathRewrite: (path) => `/api${path}`,
 *   }))
 *
 * User app Next.js: /api/auth/session cookie yozadi, /api/* javoblarni
 * normalizatsiya qiladi. Shuning uchun /api bu yerda Next handler orqali
 * ishlaydi — /api prefiksi kesilmaydi, backendga server ichida yo'naltiriladi.
 */
app.all('*', (req, res) => handle(req, res))

app.listen(PORT, HOST, () => {
  console.log(`User panel: http://${HOST}:${PORT}`)
  console.log(`Backend: ${API_PROXY_TARGET}`)
  console.log(`Uploads proxy: ${API_PROXY_TARGET}/uploads`)
  console.log(`API: Next.js /app/api/* (cookie auth + /api/... saqlanadi)`)
})
