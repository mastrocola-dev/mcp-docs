import { fileURLToPath } from 'node:url'
import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions'
import { createHandler } from './http.ts'

const handler = createHandler(process.env.DOCS_ROOT ?? fileURLToPath(new URL('../docs', import.meta.url)))

export async function mcp(request: HttpRequest): Promise<HttpResponseInit> {
  const response = await handler.fetch(new Request(request.url, { method: request.method, headers: request.headers, body: await request.text() }))
  return { status: response.status, headers: response.headers, body: await response.text() }
}

app.http('mcp', { route: 'mcp', methods: ['POST'], authLevel: 'anonymous', handler: mcp })
