import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { generateApi } from 'swagger-typescript-api'

const swagger = JSON.parse(await readFile(new URL('../openapi/swagger.json', import.meta.url), 'utf8'))
// Authentication belongs to the two handwritten Axios calls in the components.
const paths = Object.fromEntries(Object.entries(swagger.paths).filter(([path]) =>
  path === '/observation_points' || path.startsWith('/observation_points/'),
))

await generateApi({
  fileName: 'ObservationPointsApi.ts',
  spec: { ...swagger, paths },
  output: fileURLToPath(new URL('../src/api/generated/', import.meta.url)),
  httpClientType: 'axios',
  generateClient: true,
  generateResponses: true,
})
