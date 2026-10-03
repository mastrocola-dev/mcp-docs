import assert from 'node:assert/strict'
import { test } from 'node:test'
import functions from '@azure/functions'

process.env.DOCS_ROOT = 'test/fixtures/docs'
const { mcp } = await import('../src/function.ts')

const post = (message: object) => mcp(new functions.HttpRequest({ url: 'http://localhost/mcp', method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: { string: JSON.stringify(message) } }))

test('answers a JSON-RPC request', async () => {
  const response = await post({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
  assert.equal(response.status, 200)
  assert.match(String(response.body), /search_documents/)
})

test('reads the documents under DOCS_ROOT', async () => {
  const response = await post({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'list_documents', arguments: { type: 'adr' } } })
  assert.match(String(response.body), /ADR-001: Sample decision/)
})

test('rejects a body that is not JSON-RPC', async () => {
  const response = await post({ hello: 'world' })
  assert.equal(response.status, 400)
})
