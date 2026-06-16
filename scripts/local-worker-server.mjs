import http from 'node:http'
import { Readable } from 'node:stream'
import worker from '../proxy-worker/worker.js'

const port = Number(process.env.PORT || 8787)
const host = process.env.HOST || '127.0.0.1'

const server = http.createServer(async (req, res) => {
  const chunks = []

  req.on('data', chunk => chunks.push(chunk))
  req.on('end', async () => {
    try {
      const request = new Request(`http://${host}:${port}${req.url}`, {
        method: req.method,
        headers: req.headers,
        body: chunks.length ? Buffer.concat(chunks) : undefined,
      })
      const response = await worker.fetch(request)

      res.writeHead(response.status, Object.fromEntries(response.headers))

      if (!response.body) {
        res.end()
        return
      }

      Readable.fromWeb(response.body).pipe(res)
    } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
      res.end(error.stack || error.message)
    }
  })
})

server.listen(port, host, () => {
  console.log(`MSPlay local worker running at http://${host}:${port}`)
})
