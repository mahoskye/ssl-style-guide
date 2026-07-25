# Contributing

## Prerequisites

- [Bun](https://bun.sh) — runs the tooling and the MCP server (CI uses 1.3.3)
- Node.js + npm — only for the Tree-sitter grammar (`ssl-style-guide/tree-sitter-ssl/`)
- Go — only if you build the `starlims-lsp` binaries from source; most workflows
  download them instead (see below)

## Setup

```bash
git clone https://github.com/mahoskye/ssl-style-guide.git
cd ssl-style-guide

# tooling dependencies (generators and checks)
cd tools && bun install && cd ..

# MCP server dependencies + LSP binary
cd ssl-mcp-server
bun install
bun run fetch-lsp    # downloads the pinned starlims-lsp release binary
cd ..

# reference repo as a sibling checkout (required for the full check suite:
# the machine-doc packs embed its guide content, and the drift check
# compares against it — CI clones it the same way)
git clone https://github.com/mahoskye/starlims-ssl-reference.git ../ssl-docs
```

The LSP binaries are not tracked in git. `bun run fetch-lsp` (in
`ssl-mcp-server/`) downloads the release pinned in
`ssl-mcp-server/lsp-version.json`; pass a tag to move the pin, or use
`bun run bundle-lsp` to build from a sibling `starlims-lsp` checkout.

## Canonical sources vs. generated files

Always edit the canonical file, then regenerate; never hand-edit generated
copies:

| Canonical | Generated | Regenerate with |
|-----------|-----------|-----------------|
| `ssl-style-guide/`, `agent-guides/` docs and schema | `agent-guides/machine/` packs | `bun tools/generate-machine-docs.mjs` |
| everything the MCP server serves | `ssl-mcp-server/data/` mirror | `cd ssl-mcp-server && bun scripts/bundle-data.mjs` |
| `agent-guides/agents/*.agent.md` | per-tool agent adapters (git-ignored) | `bun tools/generate-agents.mjs` |

## Checks

Run before opening a PR (CI runs the same):

```bash
cd ssl-mcp-server
bun run check              # TypeScript
bun run check:consistency  # data mirror + machine docs + agent adapters
cd ..
bun tools/check-reference-drift.mjs  # inventory vs. reference repo (skips without sibling checkout)
```

The Tree-sitter grammar has its own commands (`npm run gen`, `npm test`) under
`ssl-style-guide/tree-sitter-ssl/`; the test corpus is maintained outside the
repository, so `npm test` is a maintainer step.

## Pull requests

- Use conventional-commit-style titles (`feat:`, `fix:`, `docs:`, `chore:`),
  scoped where helpful (e.g. `chore(mcp): …`).
- Keep generated files in the same PR as their canonical change so checks pass.
- Reference material comes from the
  [starlims-ssl-reference](https://github.com/mahoskye/starlims-ssl-reference)
  repo; content corrections belong there, and flow here through the re-vendor
  scripts.
