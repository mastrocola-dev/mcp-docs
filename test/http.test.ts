import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import { createHandler } from '../src/http.ts'

const handler = createHandler('test/fixtures/docs')
const endpoint = new URL('http://localhost/mcp')
const client = new Client({ name: 'test', version: '0.0.0' })
await client.connect(new StreamableHTTPClientTransport(endpoint, { fetch: (input, init) => handler.fetch(new Request(input, init)) }))
after(() => client.close())

test('serves the same tools over streamable HTTP', async () => {
  const { tools } = await client.listTools()
  assert.deepEqual(
    tools.map(({ name }) => name),
    ['list_documents', 'read_document', 'search_documents'],
  )
})

test('answers a tool call', async () => {
  const result = await client.callTool({ name: 'read_document', arguments: { path: 'adr/001-sample.md' } })
  assert.match(JSON.stringify(result.content), /ADR-001: Sample decision/)
})

test('keeps no session between requests', async () => {
  const response = await handler.fetch(new Request(endpoint, { method: 'GET', headers: { accept: 'text/event-stream' } }))
  assert.equal(response.status, 405)
})
