import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

/**
 * Serves /api/broker (the Alice Blue gateway) during `npm run dev`, using the
 * exact same handler that runs as a serverless function in production.
 */
function brokerDevApi(env: Record<string, string>): Plugin {
  return {
    name: 'broker-dev-api',
    apply: 'serve',
    configureServer(server) {
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v
      server.middlewares.use('/api/broker', async (req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/broker.ts')
          let raw = ''
          for await (const chunk of req) raw += chunk
          const url = new URL(req.url || '/', 'http://localhost')
          const request: any = req
          request.query = Object.fromEntries(url.searchParams)
          request.body = raw ? raw : undefined
          const response: any = res
          response.status = (code: number) => { res.statusCode = code; return response }
          response.json = (data: unknown) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          }
          await (mod.default as any)(request, response)
          if (!res.writableEnded) res.end()
        } catch (e: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: e?.message || 'Dev API error' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/',
    plugins: [inspectAttr(), react(), brokerDevApi(env)],
    server: { port: 8080 },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
