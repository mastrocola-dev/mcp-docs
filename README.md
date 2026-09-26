# mcp-docs

MCP server exposing the mastrocola.dev architecture documentation ([docs](https://github.com/mastrocola-dev/docs)) to agents. Read-only, stdio transport.

## Run

```sh
npm ci
node src/main.ts ../docs
```

The only argument is the root of a `docs` checkout. The server reads files; it knows nothing about git or GitHub.

## Tools

| Tool | Input | Returns |
|---|---|---|
| `list_documents` | optional `type`: `adr`, `architecture`, `runbooks` | path, type, title and, for ADRs, status |
| `read_document` | `path` from `list_documents` | full Markdown; paths outside the root or non-Markdown files are refused |
| `search_documents` | `query` (2+ chars) | case-insensitive matches with path, line number and line text |

All tools are annotated `readOnlyHint: true`.

## Test

```sh
npm test
npm run test:coverage
```

## Decisions

- **Domain tools, not filesystem tools.** The value over a generic filesystem server is knowing the documentation's shape: document types, titles and ADR status.
- **Tools, not MCP resources.** With resources the host decides what enters the context; with tools the model decides what to look up.
- **Docs root as an argument.** Tests run against fixtures, with no network, rate limits or credentials.
- **Naive search on purpose.** Substring matching is enough for a handful of documents; semantic search belongs to the future `mcp-rag`.
- **Run from a checkout, no package.** Node refuses type stripping inside `node_modules`, so publishing would require a build step. Locally, hosts start the server from a sibling checkout; in the cloud, MCP servers run as their own Container Apps over streamable HTTP, so a package is never needed.
- **Conventions copied from `service-agent`.** Node 24 type stripping, Biome, EditorConfig, `node:test`. A shared template is extracted only when a third repository shows what is truly common.
- **`lineWidth: 320`.** Author's choice: lines are not wrapped by the formatter.
