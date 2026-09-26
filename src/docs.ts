import { readdir, readFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'

export const types = ['adr', 'architecture', 'runbooks'] as const
export type DocumentType = (typeof types)[number]

const field = (text: string, pattern: RegExp) => text.match(pattern)?.[1]?.trim()

async function documents(root: string, type?: DocumentType) {
  const nested = await Promise.all(
    (type ? [type] : types).map(async (dir) => {
      const names = await readdir(join(root, dir)).catch(() => [])
      return names.filter((name) => name.endsWith('.md')).map((name) => ({ type: dir, path: `${dir}/${name}` }))
    }),
  )
  return nested.flat().sort((a, b) => a.path.localeCompare(b.path))
}

export async function listDocuments(root: string, type?: DocumentType) {
  return Promise.all(
    (await documents(root, type)).map(async ({ type, path }) => {
      const text = await readFile(join(root, path), 'utf8')
      return { path, type, title: field(text, /^# (.+)$/m) ?? path, status: field(text, /^\*\*Status:\*\*(.+)$/m) }
    }),
  )
}

export async function readDocument(root: string, path: string) {
  const full = resolve(root, path)
  if (!full.startsWith(resolve(root) + sep) || !full.endsWith('.md')) throw new Error(`Not a document: ${path}`)
  return readFile(full, 'utf8')
}

export async function searchDocuments(root: string, query: string) {
  const needle = query.toLowerCase()
  const matches = await Promise.all(
    (await documents(root)).map(async ({ path }) => {
      const lines = (await readFile(join(root, path), 'utf8')).split('\n')
      return lines.flatMap((text, index) => (text.toLowerCase().includes(needle) ? [{ path, line: index + 1, text: text.trim() }] : []))
    }),
  )
  return matches.flat()
}
