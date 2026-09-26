import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'
import { listDocuments, readDocument, searchDocuments, types } from './docs.ts'

const readOnly = { readOnlyHint: true, openWorldHint: false }
const text = (value: unknown) => ({
  content: [{ type: 'text' as const, text: typeof value === 'string' ? value : JSON.stringify(value) }],
})

export function createServer(root: string) {
  const server = new McpServer({ name: 'mcp-docs', version: '0.1.0' })

  server.registerTool(
    'list_documents',
    {
      description: 'List architecture documents (ADRs, architecture notes, runbooks) with path, title and, for ADRs, status.',
      inputSchema: z.object({ type: z.enum(types).optional() }),
      annotations: readOnly,
    },
    async ({ type }) => text(await listDocuments(root, type)),
  )

  server.registerTool(
    'read_document',
    {
      description: 'Read the full Markdown of one document.',
      inputSchema: z.object({ path: z.string().describe('Path as returned by list_documents, e.g. adr/001-multi-repo.md') }),
      annotations: readOnly,
    },
    async ({ path }) => text(await readDocument(root, path)),
  )

  server.registerTool(
    'search_documents',
    {
      description: 'Case-insensitive text search across all documents. Returns path, line number and line text of each match.',
      inputSchema: z.object({ query: z.string().min(2) }),
      annotations: readOnly,
    },
    async ({ query }) => text(await searchDocuments(root, query)),
  )

  return server
}
