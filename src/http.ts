import { createMcpHandler } from '@modelcontextprotocol/server'
import { createServer } from './server.ts'

export const createHandler = (root: string) => createMcpHandler(() => createServer(root))
