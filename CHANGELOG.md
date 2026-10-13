# Changelog

This repository releases two versioned artifacts together:

- the **schema** (`metadata.version` in `ssl-style-guide/ssl-style-guide.schema.yaml`);
- the **MCP server** (`ssl-mcp-server/package.json`, mirrored in `src/constants.ts`).

Agent definitions carry their own integer `version` in their frontmatter.
Releases from 2026-10 onward are tagged `schema-vX.Y.Z` and `mcp-vX.Y.Z`. The
release process is described in [CONTRIBUTING.md](CONTRIBUTING.md#releases).
Entries before this file existed are reconstructed from the release commits.

## [Unreleased]

### Added
- Task-brief and run-record interfaces (`agent-guides/agent-interfaces.md`),
  wired into the planner, developer and reviewer. The README gains a *Role
  and Interfaces* section, and a *Rule proposal* issue template is added.
  `check-agent-contract.mjs` is renamed `check-agent-wiring.mjs` (#97).
- `style-calibration/`: six purpose-built review tasks with specifications,
  unapproved initial drafts and SSL tests, plus local revision and check
  tools (#99).
- A design proposal for a single rules source,
  `docs/design/rules-source.md`. It is not adopted (#105).
- This changelog, and `schema-v*` / `mcp-v*` release tags (#100).
- Rules source pilot (#101): the data-source rules are now 17 records in
  `rules/data-sources/`. `tools/generate-rules.mjs` generates the schema's
  `module_structure.data_source_modules`, the rule lists in the
  `ssl-new-datasource` skill and the agent guide's §4A, and `rules/INDEX.md`;
  the data-sources pack lists and the foundation's data-source bullets come
  from the same records. The parsed schema is unchanged.
- Rules source, SQL domain (#101): 33 records in `rules/sql/` generate the
  schema's `sql.formatting` and `sql.parameters`, the `ssl-format` skill's SQL
  rule lists, the agent guide's SQL quick-reference rules, the `database` and
  `sql` pack lists, and the foundation's SQL bullets. The parsed schema is
  unchanged.
- Rules source, server scripts (#101): 66 records in `rules/server-scripts/`
  cover file shape, banners and doc blocks, `:PARAMETERS`/`:DEFAULT` order,
  calling convention, error handling, boundary contracts, transactions,
  logging and access modifiers. They generate the schema's
  `procedures.visibility_annotations`, `error_handling.guidance` and
  `documentation.file_banner`, the transactions, procedures, error-handling,
  logging and module-structure pack lists, the foundation's server-script
  bullets, and rule regions in the `ssl-new-procedure` skill and the
  server-script baseline. The parsed schema is unchanged.

### Changed
- Element data is re-vendored from the published reference: 118 of 460
  elements changed. The drift check now compares content, not only names
  and totals, and reports drift as a warning (`--strict` makes it an
  error) (#94).
- Language corrections across the guides, schema, EBNF and skills. `:ERROR`
  is a trailing handler that protects the statements before it. Class,
  object, data-source, SQL-call, type, member, scope and naming claims are
  corrected, along with assignment targets and access modifiers. Claims are
  re-checked against the published reference (#96, #103, #104).
- Agent tuning: a severity rubric in `ssl-review`, one fallback when the MCP
  server is not attached, a cleanup worked example in the server-script
  guide, and several guide contradictions resolved. Agent versions:
  developer 23, reviewer 15, planner 12, handoff 8, docwriter 4 (#107).
- Tree-sitter: comments parse (the comment token never matched before), the
  joined label form `:LABELName;` gets its own field, and label names and
  the `/*@private;` and `/*@protected;` forms are highlighted. The EBNF
  models `:ERROR` as a trailing handler and assignment as an expression
  (#102).
- README, CONTRIBUTING and the agent, Tree-sitter and MCP READMEs describe
  the repository after the drift audit: its role, the nine skills and six
  agents, sibling checkouts, rule proposals and the full check list (#92).
- `ssl-refactor-plan` writes specs under `docs/specs/`, matching the agents.
- The `ssl-new-datasource` SQL template packs its column list, following the
  compact SQL rules that `ssl-format` applies to data-source bodies.
- `ssl-format` marks its `MERGE` rules as rules for formatting existing code.
  Agents do not write `MERGE`.
- The README no longer hard-codes the schema version.
- The schema's `last_updated` now matches the 1.7.2 release date.
- SQL `CASE` layout follows the formatter: `WHEN`/`ELSE` 4 spaces under
  `CASE`, `END` aligned with `CASE`. The schema, the agent guide and
  `ssl-format` said 2 (#106).

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
