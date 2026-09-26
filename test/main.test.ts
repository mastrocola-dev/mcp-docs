import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

const main = (args: string[]) =>
  spawnSync(process.execPath, ['src/main.ts', ...args], {
    encoding: 'utf8',
    env: { PATH: process.env.PATH, NODE_V8_COVERAGE: process.env.NODE_V8_COVERAGE },
  })

test('exits 1 without a docs root', () => {
  const { status, stderr } = main([])
  assert.equal(status, 1)
  assert.match(stderr, /Usage/)
})

test('exits 1 when the docs root does not exist', () => {
  const { status, stderr } = main(['missing'])
  assert.equal(status, 1)
  assert.match(stderr, /ENOENT/)
})

test('serves over stdio until stdin closes', () => {
  const { status } = main(['test/fixtures/docs'])
  assert.equal(status, 0)
})
