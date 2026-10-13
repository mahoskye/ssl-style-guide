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

# reference repo as a sibling checkout — OPTIONAL. Only the drift check's
# name-set and content comparisons use it, and they skip cleanly without
# it. Every other check passes on a plain clone. CI clones it to get the
# comparisons too.
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
| `rules/` records (see [rules/README.md](rules/README.md)) | `rules/INDEX.md`, the schema's generated regions, `<!-- rules: -->` regions in guides and skills | `bun tools/generate-rules.mjs`, then the machine docs |
| `ssl-style-guide/`, `agent-guides/` docs and schema, `rules/` | `agent-guides/machine/` packs | `bun tools/generate-machine-docs.mjs` |
| everything the MCP server serves | `ssl-mcp-server/data/` mirror | `cd ssl-mcp-server && bun scripts/bundle-data.mjs` |
| `agent-guides/agents/*.agent.md` | per-tool agent adapters (git-ignored) | `bun tools/generate-agents.mjs` |

## Checks

Run before opening a PR (CI runs the same):

```bash
cd ssl-mcp-server
bun run check              # TypeScript
bun run check:consistency  # data mirror + rules + machine docs + agent adapters
cd ..
bun tools/check-skill-examples.mjs   # skill and rule examples (needs the LSP binary)
bun tools/check-reference-drift.mjs  # inventory vs. reference repo (skips without sibling checkout)
```

The drift check reports content drift (vendored element data behind the
reference repo) as a warning, so reference-repo merges don't block unrelated
PRs. Pass `--strict` to make it an error, for example before a release.

## Re-vendoring reference data

When the drift check reports content drift, refresh in this order:

```bash
cp ../ssl-docs/content/data/ssl-element-meta.json ssl-style-guide/ssl-element-meta.json
python3 tools/generate_element_reference.py
bun tools/generate-machine-docs.mjs
cd ssl-mcp-server && bun run bundle-data && cd ..
bun tools/check-reference-drift.mjs --strict
```

Note the reference-repo commit you vendored from in the PR description.

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
- Add a line under `[Unreleased]` in `CHANGELOG.md` for any change a consumer
  would notice (rules, schema, agents, skills, MCP behavior, grammars).

## Releases

A release is one PR titled `chore: release schema X.Y.Z and ssl-mcp-server A.B.C`
(name only the artifacts that changed):

1. Bump `metadata.version` and `metadata.last_updated` in
   `ssl-style-guide/ssl-style-guide.schema.yaml`, and/or the version in
   `ssl-mcp-server/package.json` and `ssl-mcp-server/src/constants.ts`.
2. Regenerate: `bun tools/generate-machine-docs.mjs`, then
   `cd ssl-mcp-server && bun run bundle-data`.
3. Move the `[Unreleased]` entries in `CHANGELOG.md` under a new heading
   for the release.
4. After merging, tag the merge commit and push the tags:

   ```bash
   git tag schema-vX.Y.Z && git tag mcp-vA.B.C && git push origin --tags
   ```
