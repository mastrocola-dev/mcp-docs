import assert from 'node:assert/strict'
import { test } from 'node:test'
import { listDocuments, readDocument, searchDocuments } from '../src/docs.ts'

const root = 'test/fixtures/docs'

test('lists Markdown documents with title and ADR status', async () => {
  assert.deepEqual(await listDocuments(root), [
    { path: 'adr/001-sample.md', type: 'adr', title: 'ADR-001: Sample decision', status: 'Accepted' },
    { path: 'adr/002-old.md', type: 'adr', title: 'ADR-002: Superseded decision', status: 'Superseded' },
    { path: 'architecture/agent.md', type: 'architecture', title: 'Agent architecture', status: undefined },
    { path: 'runbooks/deploy.md', type: 'runbooks', title: 'Runbook: Deploy', status: undefined },
  ])
})

test('filters by type', async () => {
  const documents = await listDocuments(root, 'runbooks')
  assert.deepEqual(
    documents.map(({ path }) => path),
    ['runbooks/deploy.md'],
  )
})

test('tolerates a missing type directory', async () => {
  assert.deepEqual(await listDocuments('test/fixtures', 'adr'), [])
})

test('reads a document', async () => {
  assert.match(await readDocument(root, 'adr/001-sample.md'), /event-driven/)
})

test('refuses paths outside the root or non-Markdown files', async () => {
  await assert.rejects(readDocument(root, '../../package.json'), /Not a document/)
  await assert.rejects(readDocument(root, 'architecture/diagram.svg'), /Not a document/)
})

test('searches case-insensitively with line numbers', async () => {
  assert.deepEqual(await searchDocuments(root, 'event'), [
    { path: 'adr/001-sample.md', line: 8, text: 'Use event-driven services.' },
    { path: 'runbooks/deploy.md', line: 3, text: 'Run the pipeline, then check the EVENT log.' },
  ])
})
