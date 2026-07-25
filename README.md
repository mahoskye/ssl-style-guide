# STARLIMS SSL Style Guide

Tool-agnostic reference and tooling source of truth for **STARLIMS Scripting
Language (SSL) v11**.

This repository keeps the authoritative SSL rule set, parser-facing grammar,
editor-support files, and agent-facing guidance aligned. When files disagree,
prefer the machine-readable schema and the checked-in canonical guides over
summary documentation. Alignment is partly enforced by the checked-in
consistency scripts (run in CI) and partly maintained by review; not every
prose surface is validated automatically.

For prerequisites, setup, and the check commands, see
[CONTRIBUTING.md](CONTRIBUTING.md).

## Canonical Sources

- `ssl-style-guide/ssl-style-guide.schema.yaml`
  Main machine-readable style guide. It distinguishes authoritative language
  behavior from style guidance and advisory guidance.
- `agent-guides/ssl_agent_instructions.md`
  Detailed language reference for agents, including validated behavior and
  common SSL pitfalls.
- `agent-guides/ssl_refactoring_guide.md`
  Refactoring workflow, structure, and formatting guidance for maintained code.

## Repo Contents

- `ssl-style-guide/ssl-style-guide.schema.yaml`
  Canonical SSL rules, formatting preferences, naming guidance, and the
  directly-instantiable built-in class inventory.
- `ssl-style-guide/ssl-ebnf-grammar.md`
  Formal EBNF for SSL v11.
- `ssl-style-guide/tree-sitter-ssl/`
  Tree-sitter grammar and query files for SSL editor tooling.
- `ssl-style-guide/ssl.tmLanguage.updated.json`
  TextMate grammar for editors that consume TextMate scopes.
- `agent-guides/`
  Agent-facing language and refactoring references, generated machine packs,
  workflow skills, and canonical agent definitions.
- `ssl-mcp-server/`
  MCP server that packages the public reference data for MCP-compatible clients.

## Guidance Model

The schema classifies guidance into three levels:

- `authoritative`
  Accepted SSL parsing and execution behavior.
- `style_only`
  Repository and refactoring preferences for readability and consistency.
- `advisory`
  Maintainability, security, and performance guidance.

Examples of authoritative rules include uppercase colon-prefixed keywords,
mandatory statement terminators, declaration-before-use, SSL's 1-based arrays,
and the distinction between direct built-in calls and `DoProc` / `ExecFunction`
for script procedures.

Examples of style guidance include tabs preferred for indentation, no spaces
around member-access colons, one statement per line, and comment-region usage
for editor folding.

### Data Source Files

SSL and SQL data source files are preprocessed by server-side builders before
SSL compilation. They use inline `:=` parameter defaults and (for SQL data
sources) builder directives such as `:DSN` and `:TABLENAME` that are not part of
the SSL grammar. The grammar, parser, and formatting rules in this repository
target the runtime SSL language; data source differences are documented in
`agent-guides/ssl_agent_instructions.md` §4A and
`agent-guides/ssl_refactoring_guide.md` §2.4.

## Tooling Surfaces

### Tree-sitter Grammar

The Tree-sitter grammar tracks the documented language surface closely and calls
out the few editor-oriented approximations it makes. Work in
`ssl-style-guide/tree-sitter-ssl/` with:

```bash
cd ssl-style-guide/tree-sitter-ssl
npm install
npm run gen
npm test
```

`npm test` runs the Tree-sitter corpus tests; the corpus is maintained locally
and is not part of this repository, so the test step applies to maintainer
checkouts only.

### TextMate Grammar

`ssl-style-guide/ssl.tmLanguage.updated.json` carries the syntax-highlighting
inventory for editors that rely on TextMate grammars. Built-in function
inventories should stay aligned with Tree-sitter highlighting and the checked-in
element inventory. Built-in class inventories should stay aligned with the
schema and Tree-sitter highlights.

### MCP Server

`ssl-mcp-server/` exposes the bundled SSL reference through MCP. Its runtime
data under `ssl-mcp-server/data/` is a mirror of the canonical public docs plus
checked-in external inventory snapshots and generated machine packs.

When canonical docs change, or when checked-in external inventory snapshots are
updated, refresh the mirrored MCP data with:

```bash
bun tools/generate-machine-docs.mjs

cd ssl-mcp-server
bun scripts/bundle-data.mjs
bun run check:consistency
```

### Machine Packs

`agent-guides/machine/` contains generated compact context for agents:
`foundation.md`, `category-index.json`, and category packs such as `database`,
`loops`, `strings`, `data-sources`, `classes`, `error-handling`, `formatting`,
and `naming`. These files are generated from the schema, agent guides, element
inventory, and selected guide paths from the
[starlims-ssl-reference](https://github.com/mahoskye/starlims-ssl-reference)
repo (checked out locally as `ssl-docs`). Agents load the foundation first
and retrieve task/category detail through the MCP `ssl_context_pack` tool or
`ssl://machine/*` resources.

## Agent Skills

`agent-guides/skills/` contains eight SSL workflow skills:

- `ssl-review`
- `ssl-refactor`
- `ssl-refactor-plan`
- `ssl-lookup`
- `ssl-format`
- `ssl-new-procedure`
- `ssl-new-class`
- `ssl-new-datasource`

These skills should follow the schema and agent guides rather than introducing
alternative rules or wording.

## Agent Definitions

`agent-guides/agents/` contains the canonical, tool-neutral definitions for
seven SSL developer agents:

- `ssl-planner` — plan SSL work and produce implementation specs
- `ssl-developer` — general SSL coding: implement, review, refactor, scaffold
- `ssl-reviewer` — review SSL code against the style guide (read-only)
- `ssl-refactorer` — plan behavior-preserving cleanup for developer handoff
- `ssl-verifier` — adversarially verify review findings and spec claims (read-only)
- `ssl-handoff` — ready functionally-done code for production handoff
- `ssl-docwriter` — write developer documentation with verified technical claims

Each agent is authored once; `tools/generate-agents.mjs` emits per-tool adapter
files — `.github/agents/` for GitHub Copilot, `.opencode/agents/` for OpenCode,
and `.claude/agents/` for Claude Code. These adapters are git-ignored build
artifacts. For normal use across repositories, deploy them to user-level agent
directories with `bun tools/deploy-agents.mjs` after generation. See
`agent-guides/agents/README.md` for the format, user-level install locations,
and check commands; `bun run check:consistency` (in `ssl-mcp-server/`) also runs
`--check` to flag adapters that have drifted from their sources.

## Metadata

- Version: `1.4.0` (mirrors `metadata.version` in `ssl-style-guide/ssl-style-guide.schema.yaml`)
- SSL version: `v11`
- Maintainers: `PaperBull / maho`
- License: `MIT`

## Disclaimer

This project is an independent research effort and is not affiliated with,
endorsed by, or sponsored by Abbott Laboratories or its STARLIMS product. All
product names, logos, and brands are property of their respective owners.
