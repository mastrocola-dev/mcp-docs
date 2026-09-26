import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { Client, InMemoryTransport } from '@modelcontextprotocol/client'
import { createServer } from '../src/server.ts'

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
await createServer('test/fixtures/docs').connect(serverTransport)
const client = new Client({ name: 'test', version: '0.0.0' })
await client.connect(clientTransport)
after(() => client.close())

const call = (name: string, args: Record<string, unknown>) => client.callTool({ name, arguments: args })

test('exposes three read-only tools', async () => {
  const { tools } = await client.listTools()
  assert.deepEqual(
    tools.map(({ name, annotations }) => [name, annotations?.readOnlyHint]),
    [
      ['list_documents', true],
      ['read_document', true],
      ['search_documents', true],
    ],
  )
})

test('returns documents as JSON text', async () => {
  const result = await call('list_documents', { type: 'adr' })
  assert.match(JSON.stringify(result.content), /ADR-001: Sample decision/)
})

test('reports domain errors as tool errors', async () => {
  const result = await call('read_document', { path: '../../package.json' })
  assert.equal(result.isError, true)
  assert.match(JSON.stringify(result.content), /Not a document/)
})

test('validates input against the schema', async () => {
  const result = await call('search_documents', { query: 'x' })
  assert.equal(result.isError, true)
})
