# Changelog

This repository releases two versioned artifacts together:

- the **schema** (`metadata.version` in `ssl-style-guide/ssl-style-guide.schema.yaml`);
- the **MCP server** (`ssl-mcp-server/package.json`, mirrored in `src/constants.ts`).

Agent definitions carry their own integer `version` in their frontmatter.
Releases from 2026-10 onward are tagged `schema-vX.Y.Z` and `mcp-vX.Y.Z`. The
release process is described in [CONTRIBUTING.md](CONTRIBUTING.md#releases).
Entries before this file existed are reconstructed from the release commits.

## [Unreleased]

### Changed
- `ssl-refactor-plan` writes specs under `docs/specs/`, matching the agents.
- The `ssl-new-datasource` SQL template packs its column list, following the
  compact SQL rules that `ssl-format` applies to data-source bodies.
- `ssl-format` marks its `MERGE` rules as rules for formatting existing code.
  Agents do not write `MERGE`.
- The README no longer hard-codes the schema version.
- The schema's `last_updated` now matches the 1.7.2 release date.

### Removed
- The `agent-quality-lab/` ignore entry. The lab now lives in its own
  private repository.

## MCP 1.14.0 — 2026-09-21
- Agent roster rework. The MCP server's validation runs with strict
  diagnostics, which needs starlims-lsp v0.24.0 or later.

## Schema 1.7.2, MCP 1.12.1 — 2026-09-20
- An explicit `+` exponent sign (`9.0E+1`) is valid (#73).
- Pins starlims-lsp v0.22.0, then v0.23.0.

## MCP 1.12.0 — 2026-08-29
- Validation passes `--hungarian` and `--hungarian-types`. Pins starlims-lsp
  v0.19.0 to v0.21.0.

## Schema 1.7.1, MCP 1.11.1 — 2026-08-28
- Adopts the server-script style baseline (#56).

## Schema 1.7.0, MCP 1.11.0 — 2026-08-28
- SQL identifier casing depends on the dialect, and is preserved by default.
- Validation always passes `--info`. Pins starlims-lsp v0.18.0.

## MCP 1.10.0 — 2026-08-28
- Pins starlims-lsp v0.17.0.

## Schema 1.6.0, MCP 1.9.0 — 2026-08-08
- Documents data-source comments, `@name` placeholders and defaults, the
  scope of `DoProc` in classes, and the 0-based indexing exception for .NET.
- Pins starlims-lsp v0.16.0.

## Schema 1.5.0, MCP 1.8.0 — 2026-08-07
- Adds the `KEEP (DENSE_RANK ...)` layout section to the SQL reference.

Earlier versions (schema 1.3.0 to 1.4.x, MCP 1.4.0 to 1.7.0, March–July 2026)
predate release commits. See the git history.
