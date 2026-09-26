import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio'
import { createServer } from './server.ts'

if (!process.argv[2]) throw new Error('Usage: node src/main.ts <docs-root>')
const root = resolve(process.argv[2])
if (!(await stat(root)).isDirectory()) throw new Error(`Not a directory: ${root}`)

await createServer(root).connect(new StdioServerTransport())
