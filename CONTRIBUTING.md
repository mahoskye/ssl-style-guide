# Contributing

## Prerequisites

- [Bun](https://bun.sh) — runs the tooling and the MCP server (CI uses 1.3.3)
- Node.js + npm — only for the Tree-sitter grammar (`ssl-style-guide/tree-sitter-ssl/`)
- Python 3 (standard library only) — only for re-vendoring element data and
  for the style-calibration tools
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

# generate the per-tool agent adapters (git-ignored)
bun tools/generate-agents.mjs
```

The LSP binaries are not tracked in git. `bun run fetch-lsp` (in
`ssl-mcp-server/`) downloads the release pinned in
`ssl-mcp-server/lsp-version.json`; pass a tag to move the pin, or use
`bun run bundle-lsp` to build from a sibling `starlims-lsp` checkout.

### Sibling checkouts

Every check passes on a plain clone. Two optional sibling checkouts, next to
this repository, unlock extra steps:

| Directory | Repository | Used for |
|-----------|------------|----------|
| `../ssl-docs` | [starlims-ssl-reference](https://github.com/mahoskye/starlims-ssl-reference) | The drift check's name-set and content comparisons (skipped without it; `--ssl-docs <path>` points elsewhere), and re-vendoring element data |
| `../starlims-lsp` | [starlims-lsp](https://github.com/mahoskye/starlims-lsp) | `bun run bundle-lsp`, and building the validator the calibration check uses |

```bash
git clone https://github.com/mahoskye/starlims-ssl-reference.git ../ssl-docs
```

CI clones `../ssl-docs` to get the drift comparisons too.

## Canonical sources vs. generated files

Always edit the canonical file, then regenerate; never hand-edit generated
copies:

| Canonical | Generated | Regenerate with |
|-----------|-----------|-----------------|
| `rules/` records (see [rules/README.md](rules/README.md)) | `rules/INDEX.md`, `rules/rules.json`, the schema's generated regions, `<!-- rules: -->` regions in guides and skills | `bun tools/generate-rules.mjs`, then the machine docs |
| `ssl-style-guide/`, `agent-guides/` docs and schema, `rules/` | `agent-guides/machine/` packs | `bun tools/generate-machine-docs.mjs` |
| everything the MCP server serves | `ssl-mcp-server/data/` mirror | `cd ssl-mcp-server && bun run bundle-data` |
| `agent-guides/agents/*.agent.md` and `agents/_shared/` | per-tool agent adapters (git-ignored) | `bun tools/generate-agents.mjs` |
| starlims-ssl-reference element pages | `ssl-style-guide/ssl-element-reference.json` | `python3 tools/generate_element_reference.py` (see below) |

## Checks

Run before opening a PR (CI runs the same):

```bash
cd ssl-mcp-server
bun run check              # TypeScript
bun run check:consistency  # data mirror + rules + machine docs + agent adapters
cd ..
bun tools/check-reference-drift.mjs   # inventory vs. reference repo (comparisons skip without ../ssl-docs)
bun tools/check-agent-wiring.mjs      # delegation, read-only allowlists, editing protocols
bun tools/check-skill-examples.mjs    # skill and rule examples: formatted, validate clean (needs the LSP binary)
bun tools/generate-rules.mjs --check --lsp-catalog ../starlims-lsp/catalog --strict-severity  # enforced_by and severity vs. LSP catalog
```

The drift check reports content drift (vendored element data behind the
reference repo) as a warning, so reference-repo merges don't block unrelated
PRs. Pass `--strict` to make it an error, for example before a release.

The rules check warns when a record's severity differs from the default
severity of the LSP diagnostic that enforces it. Pass `--strict-severity` to
make that an error. CI passes it: every record agrees with starlims-lsp
v0.27.0. When you change a record's severity or `enforced_by`, run it locally
too (see
[rules/README.md](rules/README.md#severity-agreement-with-the-lsp)).

The Tree-sitter grammar has its own commands (`npm run gen`, `npm test`) under
`ssl-style-guide/tree-sitter-ssl/`; the test corpus is maintained outside the
repository, so `npm test` is a maintainer step. The style-calibration checks
are local too; `style-calibration/VALIDATION.md` lists them.

## Re-vendoring reference data

The element inventory and its metadata come from the published reference.
When the drift check reports content drift, refresh in this order:

```bash
cp ../ssl-docs/content/data/ssl-element-meta.json ssl-style-guide/ssl-element-meta.json
python3 tools/generate_element_reference.py
bun tools/generate-machine-docs.mjs
cd ssl-mcp-server && bun run bundle-data && cd ..
bun tools/check-reference-drift.mjs --strict
```

Note the reference-repo commit you vendored from in the PR description.

## Proposing a rule

Language and style rules live here. To add, change or remove one, or to report
a finding from an agent run, style calibration or a style survey, open an issue
with the *Rule proposal* template. Evidence must be aggregate and sanitized:
counts, patterns and invented examples, never code copied from private sources
or names of people, hosts or organizations. A maintainer reviews each proposal,
and a rule changes only after an explicit decision.

## Pull requests

- Use conventional-commit-style titles (`feat:`, `fix:`, `docs:`, `chore:`),
  scoped where helpful (e.g. `chore(mcp): …`).
- Keep generated files in the same PR as their canonical change so checks pass.
- Bump an agent's `version` in its frontmatter whenever you change it.
- Corrections to an element's documented behavior (signatures, parameters,
  errors) belong in the
  [starlims-ssl-reference](https://github.com/mahoskye/starlims-ssl-reference)
  repo and flow here when the element data is re-vendored. Rules, grammars,
  guides, agents and skills are changed here.
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
3. Run the checks, with `bun tools/check-reference-drift.mjs --strict`.
4. Move the `[Unreleased]` entries in `CHANGELOG.md` under a new heading
   for the release.
5. After merging, tag the merge commit and push the tags:

   ```bash
   git tag schema-vX.Y.Z && git tag mcp-vA.B.C && git push origin --tags
   ```
