# STARLIMS SSL Style Guide

The original best-effort definition of the **STARLIMS Scripting Language (SSL)
v11** for tooling, built from hands-on experience and from excerpts of official
and unofficial documentation.

Despite the name, this repository covers more than style. It is the home for
every SSL technical document and every language and style rule developed for
SSL:

- the rule schema and its severities;
- the grammars: EBNF, tree-sitter and TextMate;
- the agent guides, including the server-script style baseline and the SQL
  layout reference;
- the agent definitions and workflow skills;
- the formats agents exchange with other tools;
- an MCP server that packages all of the above for MCP-compatible clients.

When files disagree, prefer the machine-readable schema and the checked-in
canonical guides over summary documentation. Alignment is partly enforced by
the checks that run in CI and partly maintained by review; not every prose
surface is validated automatically.

For prerequisites, setup, and the check commands, see
[CONTRIBUTING.md](CONTRIBUTING.md). Release notes are in
[CHANGELOG.md](CHANGELOG.md).

## Role and Interfaces

Other projects sync *from* here, whether or not an artifact has a consumer
today.

The per-element reference that grew out of this work (signatures, behavior,
errors) is now published separately as
[starlims-ssl-reference](https://github.com/mahoskye/starlims-ssl-reference).
Its element inventory is re-vendored here (see `CONTRIBUTING.md`), so a
correction to an element's documented behavior is made there and flows back.
Rules, grammars, guides, agents and their formats stay here.

**Who consumes what.**

| Artifact | Consumers | How |
|----------|-----------|-----|
| `ssl-element-reference.json`, `ssl-element-meta.json` | starlims-lsp; this repo's MCP server | LSP vendors copies and checks them against a sibling checkout; MCP bundles them |
| `ssl-style-guide.schema.yaml` | MCP server; starlims-lsp and the VS Code extension (rule slugs) | MCP bundles it; the LSP and extension mirror its rule slugs by hand |
| Agent guides, EBNF, machine packs | MCP server; agents | Bundled; read at run time |
| `rules/rules.json` (generated from `rules/`) | MCP server (`ssl_style_rule`, `ssl_rules`, `ssl://rules/{id}`) | Bundled; read at run time |
| Agent definitions and skills | Claude Code, opencode, Copilot, Codex | `tools/generate-agents.mjs`, `tools/deploy-agents.mjs`, `tools/deploy-skills.mjs` |
| Tree-sitter grammar | Editors; other SSL tools (via a sibling checkout) | Grammar and queries |
| TextMate grammar | The VS Code extension | Canonical here; the extension ships a synced copy and its CI fails if the copy is edited by hand (mahoskye/vs-code-ssl-formatter#113) |

**Agent interfaces.** Tools outside this repo can give the agents a *task
brief* instead of a ticket. In return, the developer and reviewer report a
*run record* that traces what produced the code. Both formats are defined in
[`agent-guides/agent-interfaces.md`](agent-guides/agent-interfaces.md), and
this repository owns them.

**Data boundary.** This repository is public. Tools may be run against private
code, but their outputs, any code they read, and anything that identifies its
authors never land here. Only reviewed, aggregate conclusions do.

**Proposing a rule change.** Open an issue with the *Rule proposal* template.
Findings from agent runs, style calibration and style surveys come in the same
way, and a maintainer reviews each one before any rule changes. A proposal for
moving every rule into one generated source is in
[`docs/design/rules-source.md`](docs/design/rules-source.md); it is not
adopted.

## Repo Contents

- `ssl-style-guide/ssl-style-guide.schema.yaml`
  Canonical SSL rules, formatting preferences, naming guidance, and the
  directly-instantiable built-in class inventory.
- `ssl-style-guide/ssl-ebnf-grammar.md`
  Formal EBNF for SSL v11.
- `ssl-style-guide/sql-canonical-compact-reference.md`
  The canonical compact layout for SQL embedded in SSL strings and in SQL
  data-source bodies.
- `ssl-style-guide/ssl-element-reference.json`, `ssl-element-meta.json`
  The vendored element inventory (460 elements) and its per-element metadata.
- `ssl-style-guide/tree-sitter-ssl/`
  Tree-sitter grammar and query files for SSL editor tooling.
- `ssl-style-guide/ssl.tmLanguage.updated.json`
  TextMate grammar for editors that consume TextMate scopes.
- `agent-guides/`
  The language reference, refactoring guide and server-script style baseline
  for agents, the agent interface formats, generated machine packs, workflow
  skills, and canonical agent definitions.
- `ssl-mcp-server/`
  MCP server that packages the reference data, rules and guides for
  MCP-compatible clients.
- `style-calibration/`
  The style-calibration review exercise (see below).
- `docs/design/`
  Design proposals.
- `tools/`
  Generators, deploy scripts, and the checks that CI runs.

## Canonical Sources

- `agent-guides/ssl_design_philosophy.md`
  Why the rules are what they are, and which wins when two conflict: clarity
  and simplicity first, product style second. Read it before the rules.
- `ssl-style-guide/ssl-style-guide.schema.yaml`
  Main machine-readable style guide. It distinguishes authoritative language
  behavior from style guidance and advisory guidance.
- `agent-guides/ssl_agent_instructions.md`
  Detailed language reference for agents, including validated behavior and
  common SSL pitfalls.
- `agent-guides/ssl_refactoring_guide.md`
  Refactoring workflow, structure, and formatting guidance for maintained code.
- `agent-guides/ssl_server_script_style.md`
  The server-script style baseline: style, validation, SQL, transaction and
  error-handling practices for server scripts, with worked examples.

## Guidance Model

The schema classifies guidance into three levels:

- `authoritative`
  Documented language behavior that must match accepted SSL parsing and
  execution.
- `style_only`
  Formatting and readability conventions; configurable by team preference.
- `advisory`
  Maintainability, security, and performance guidance.

Examples of authoritative rules include uppercase colon-prefixed keywords,
mandatory statement terminators, `:PARAMETERS` and `:DEFAULT` placement, SSL's
1-based arrays, and the distinction between direct built-in calls and `DoProc` /
`ExecFunction` for script procedures.

Examples of style guidance include declaring every variable before use (SSL
does not enforce it), tabs preferred for indentation, no spaces around
member-access colons, one statement per line, and comment-region usage for
editor folding.

### Data Source Files

SSL and SQL data source files are preprocessed by server-side builders before
they run. They use inline `:=` parameter defaults and (for SQL data sources)
builder directives such as `:DSN` and `:TABLENAME` that are not part of the SSL
grammar. The grammars and formatting rules in this repository target the SSL
language itself; data source differences are documented in
`agent-guides/ssl_agent_instructions.md` §4A and
`agent-guides/ssl_refactoring_guide.md` §2.4.

## Tooling Surfaces

### Tree-sitter Grammar

The Tree-sitter grammar tracks the documented language surface closely and calls
out the few editor-oriented approximations it makes. Comments parse as SSL
defines them, from `/*` to the first `;`. The joined label form (`:LABELName;`)
and the spaced form (`:LABEL Name;`) are separate fields, because they are
different branch targets. See
[`ssl-style-guide/tree-sitter-ssl/README.md`](ssl-style-guide/tree-sitter-ssl/README.md)
for coverage and approximations. Work in `ssl-style-guide/tree-sitter-ssl/`
with:

```bash
cd ssl-style-guide/tree-sitter-ssl
npm install
npm run gen
npm test
```

`npm test` runs the Tree-sitter corpus tests; the test corpus is maintained
locally and is not part of this repository, so the test step applies to
maintainer checkouts only.

### TextMate Grammar

`ssl-style-guide/ssl.tmLanguage.updated.json` carries the syntax-highlighting
inventory for editors that rely on TextMate grammars. It is canonical here. The
VS Code extension ships a copy synced from a recorded commit of this file, so
grammar changes are made here first (mahoskye/vs-code-ssl-formatter#113).

It follows the Tree-sitter highlighting: label names, joined (`:LABELName;`)
and spaced (`:LABEL Name;`), are `entity.name.label.ssl`; the exact access
modifiers `/*@private;` and `/*@protected;` get `storage.modifier.access.ssl`
inside the comment; and a code block with no bound variable (`{|| ...}`),
which does not compile, is `invalid.illegal.ssl`. Inside double- and
single-quoted strings, SQL placeholders (`?nId?`) are
`keyword.other.database-parameter.ssl` and ODBC escapes (`{fn NOW()}`) are
`support.function.odbc-escape.ssl`.

Built-in function
inventories should stay aligned with Tree-sitter highlighting and the checked-in
element inventory. Built-in class inventories should stay aligned with the
schema, the element inventory and Tree-sitter highlights; `check:consistency`
checks both.

### MCP Server

`ssl-mcp-server/` serves the element inventory, schema, EBNF, agent guides and
machine packs through MCP tools, resources and prompts. Its `ssl_diagnose` and
`ssl_format` tools run the pinned [starlims-lsp](https://github.com/mahoskye/starlims-lsp)
binary with the strict agent profile. The runtime data under
`ssl-mcp-server/data/` is a checked-in mirror of the canonical files. See
[`ssl-mcp-server/README.md`](ssl-mcp-server/README.md) for setup, the tool list
and client configuration.

When canonical docs or the vendored element data change, refresh the mirror
with:

```bash
bun tools/generate-rules.mjs
bun tools/generate-machine-docs.mjs

cd ssl-mcp-server
bun run bundle-data
bun run check:consistency
```

### Machine Packs

`agent-guides/machine/` contains generated compact context for agents:
`foundation.md`, `category-index.json`, and 22 category packs such as
`database`, `loops`, `strings`, `data-sources`, `classes`, `error-handling`,
`formatting`, and `naming`. They are generated from the schema, agent guides,
and element inventory; packs also point to related guides in the published
[starlims-ssl-reference](https://github.com/mahoskye/starlims-ssl-reference).
Agents load the foundation first and retrieve task/category detail through the
MCP `ssl_context_pack` tool or `ssl://machine/*` resources.

## Style Calibration

`style-calibration/` holds a review exercise for developing preferred practices
across different kinds and scales of SSL work. It has six purpose-built tasks
spanning focused utilities, data sources, a policy class, and substantial
workflows. Each task has a specification, a design record, an initial draft and
SSL tests the user runs in STARLIMS.

The drafts are not approved style examples or training data. Practices develop
through human edits and recorded explanations. The schema, enforced through the
LSP and the reviewer, stays the only scorer: an accepted practice reaches it
only as a rule proposal and an explicit decision. See
[the review workflow](style-calibration/README.md).

## Agent Skills

`agent-guides/skills/` contains nine SSL workflow skills:

- `ssl-review`
- `ssl-refactor`
- `ssl-refactor-plan`
- `ssl-lookup`
- `ssl-format`
- `ssl-new-procedure`
- `ssl-new-class`
- `ssl-new-datasource`
- `ssl-unit-test`

These skills should follow the schema and agent guides rather than introducing
alternative rules or wording. `bun tools/deploy-skills.mjs` installs them where
Claude Code and opencode discover them, and `bun tools/check-skill-examples.mjs`
checks that every SSL example in them is formatted and validates clean.

## Agent Definitions

`agent-guides/agents/` contains the canonical, tool-neutral definitions for
six SSL developer agents:

- `ssl-orchestrator` — the entry point: reads intent and dispatches the others
- `ssl-planner` — specs for new work and for behavior-preserving refactors
- `ssl-developer` — implement SSL and write the SSL unit tests for it
- `ssl-reviewer` — review SSL, then refute its own findings (read-only)
- `ssl-handoff` — ready functionally-done code for production handoff
- `ssl-docwriter` — documentation, plus the project state and spec catalog

Each agent is authored once and carries its own integer `version`;
`tools/generate-agents.mjs` emits per-tool adapter files — `.github/agents/`
for GitHub Copilot, `.opencode/agents/` for OpenCode, `.claude/agents/` for
Claude Code, and a managed block in `AGENTS.md` for OpenAI Codex. These adapters
are git-ignored build artifacts. For normal use across repositories, deploy them
to user-level agent directories with `bun tools/deploy-agents.mjs` after
generation. See `agent-guides/agents/README.md` for the format, user-level
install locations, and check commands; `bun run check:consistency` (in
`ssl-mcp-server/`) also runs `--check` to flag adapters that have drifted from
their sources.

## Metadata

- Version: mirrors `metadata.version` in `ssl-style-guide/ssl-style-guide.schema.yaml`; see [CHANGELOG.md](CHANGELOG.md)
- SSL version: `v11`
- Maintainers: `PaperBull / maho`
- License: `MIT`

## Disclaimer

This project is an independent research effort and is not affiliated with,
endorsed by, or sponsored by Abbott Laboratories or its STARLIMS product. All
product names, logos, and brands are property of their respective owners.
