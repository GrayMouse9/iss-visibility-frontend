import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import http from 'node:http'
import { once } from 'node:events'
import { createServer } from 'vite'
import config from '../vite.config.ts'

const generated = await readFile(new URL('../src/api/generated/ObservationPointsApi.ts', import.meta.url), 'utf8')
const expected = [
  'GET /observation_points', 'POST /observation_points',
  'GET /observation_points/feed', 'GET /observation_points/draft',
  'PUT /observation_points/{id}/publish', 'DELETE /observation_points/{id}',
  'POST /observation_points/{id}/like',
].sort()
const generatedOperations = [...generated.matchAll(/path:\s*`([^`]+)`,\s*method:\s*"([A-Z]+)"/g)]
  .map(([, path, method]) => `${method} ${path.replaceAll('${id}', '{id}')}`).sort()
assert.deepEqual(generatedOperations, expected, 'The generated client must expose exactly seven observation-point methods')

async function sources(dir) {
  const paths = []
  for (const file of await readdir(dir, { withFileTypes: true })) {
    const path = new URL(file.name + (file.isDirectory() ? '/' : ''), dir)
    if (file.isDirectory()) paths.push(...await sources(path))
    else if (/\.tsx?$/.test(file.name)) paths.push(path)
  }
  return paths
}
const manual = []
for (const path of await sources(new URL('../src/', import.meta.url))) {
  const text = await readFile(path, 'utf8')
  for (const match of text.matchAll(/authenticationApi\.post(?:<[^>]*>)?\(\s*'([^']+)'/g)) manual.push(match[1])
}
assert.deepEqual(manual.sort(), ['/login', '/logout'], 'Only login and logout may call handwritten authentication Axios methods')
console.log('Frontend contract: 7 generated methods + 2 handwritten authentication calls = 9')

const media = await readFile(new URL('../public/media/default-observation-point.jpg', import.meta.url))
const seen = []
const upstream = http.createServer((req, res) => {
  seen.push({ url: req.url, authorization: req.headers.authorization })
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Vary', 'Origin, Accept-Encoding')
  const image = req.url.startsWith('/iss-visibility/')
  res.setHeader('Content-Type', image ? 'image/jpeg' : 'application/json')
  res.end(image ? media : JSON.stringify([{ id: 101, name: 'HTTP proxy test' }]))
})
upstream.listen(0, '127.0.0.1')
await once(upstream, 'listening')
const target = `http://127.0.0.1:${upstream.address().port}`
const vite = await createServer({
  ...config, configFile: false,
  server: { ...config.server, host: '127.0.0.1', port: 0,
    proxy: {
      '/api': { ...config.server.proxy['/api'], target },
      '/s3': { ...config.server.proxy['/s3'], target },
    },
  },
})
try {
  await vite.listen()
  const port = vite.httpServer.address().port
  function request(path, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = http.request({ hostname: '127.0.0.1', port, path, method,
        headers: { Origin: `http://localhost:${port}`, Authorization: 'Bearer proxy-test-token' },
      }, res => {
        const chunks = []
        res.on('data', chunk => chunks.push(chunk))
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }))
      })
      req.on('error', reject)
      req.setTimeout(10000, () => req.destroy(new Error('Proxy check timed out')))
      req.end()
    })
  }
  function noCors(response) {
    assert.equal(Object.keys(response.headers).some(key => key.startsWith('access-control-')), false)
    assert.equal((response.headers.vary ?? '').split(',').some(value => value.trim().toLowerCase() === 'origin'), false)
  }
  const root = await request('/')
  assert.equal(root.status, 200); noCors(root)
  const catalog = await request('/api/observation_points?min_latitude=0')
  assert.equal(catalog.status, 200); noCors(catalog)
  assert.deepEqual(JSON.parse(catalog.body), [{ id: 101, name: 'HTTP proxy test' }])
  const login = await request('/api/users/login', 'POST')
  assert.equal(login.status, 200); noCors(login)
  const image = await request('/s3/iss-visibility/proxy-test.jpg')
  assert.equal(image.status, 200); noCors(image)
  assert.equal(image.headers['content-type'], 'image/jpeg')
  assert.equal(image.headers.vary, 'Accept-Encoding')
  assert.deepEqual(image.body, media)
  assert(seen.some(req => req.url === '/api/observation_points?min_latitude=0' && req.authorization === 'Bearer proxy-test-token'))
  assert(seen.some(req => req.url === '/iss-visibility/proxy-test.jpg'))
  await new Promise(resolve => upstream.close(resolve))
  const unavailable = await request('/api/observation_points')
  assert.equal(unavailable.status, 503); noCors(unavailable)
  console.log('HTTP: no CORS headers on Vite, API GET/POST, S3 and unavailable API; proxy paths, data and Bearer header preserved')
} finally {
  await vite.close()
  if (upstream.listening) await new Promise(resolve => upstream.close(resolve))
}
