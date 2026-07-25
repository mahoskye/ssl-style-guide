# Agent Guides

Agent-facing material for working with STARLIMS SSL (v11) in this repository.
Four layers, from reference to ready-to-run:

| Layer | Path | What it is |
| --- | --- | --- |
| **Guidance documents** | `ssl_agent_instructions.md`, `ssl_refactoring_guide.md` | Detailed SSL language reference and the refactoring workflow. |
| **Machine packs** | `machine/` | Generated compact foundation and searchable category packs for agent context retrieval. |
| **Skills** | `skills/<name>/SKILL.md` | Self-contained task workflows an agent follows step by step. |
| **Agents** | `agents/<name>.agent.md` | Canonical, tool-neutral developer personas that compose the skills. |

These build on the machine-readable
`ssl-style-guide/ssl-style-guide.schema.yaml`, which remains the canonical rule
set. When sources disagree, prefer the schema and the checked-in code.

## Guidance documents

- `ssl_agent_instructions.md` — the most detailed SSL language reference:
  validated behavior, semantics, and common pitfalls.
- `ssl_refactoring_guide.md` — refactoring workflow, code structure, naming, and
  formatting expectations for maintained code.

These are reference material. Skills and agents cite them rather than restating
their rules.

## Machine packs

`machine/` contains generated, compact context for agents:

- `foundation.md` — baseline rules and retrieval protocol to load first.
- `category-index.json` — searchable categories, aliases, related categories,
  and included element names.
- `categories/*.json` — compact packs for topics such as database, loops,
  strings, data sources, classes, error handling, formatting, and naming.

Regenerate after source guidance or element inventory changes:

```bash
bun tools/generate-machine-docs.mjs
```

The MCP server also bundles these files and exposes them through
`ssl://machine/*` resources and the `ssl_context_pack` tool.

## Skills

`skills/` contains eight SSL workflow skills, each a `SKILL.md` with frontmatter
plus step-by-step instructions:

- `ssl-lookup` — look up a function signature, class member, or keyword
- `ssl-review` — review SSL code against the style guide and language rules
- `ssl-refactor` — refactor SSL code following the refactoring guide
- `ssl-refactor-plan` — plan behavior-preserving refactors for implementation
- `ssl-format` — format SSL code and embedded SQL in canonical compact style
- `ssl-new-procedure` — scaffold a new SSL procedure
- `ssl-new-class` — scaffold a new SSL class
- `ssl-new-datasource` — scaffold a new SSL or SQL data source

In Claude Code and opencode these are registered skills an agent can invoke
directly; in other tools they are Markdown files an agent reads and follows.

## Agents

`agents/` contains the canonical, tool-neutral definitions for seven SSL
developer agents:

- `ssl-developer` — general SSL coding: implement, review, refactor, scaffold
- `ssl-planner` — design SSL changes and hand implementation specs to ssl-developer
- `ssl-reviewer` — review SSL code against the style guide (read-only)
- `ssl-refactorer` — plan behavior-preserving cleanup for developer handoff
- `ssl-verifier` — adversarially verify review findings and spec claims (read-only)
- `ssl-handoff` — ready functionally-done code for production handoff
- `ssl-docwriter` — write developer documentation with verified technical claims

Each agent is a thin persona: it delegates to the skills above and cites the
guidance documents rather than carrying its own copy of the rules. Each agent is
authored once here; `tools/generate-agents.mjs` emits git-ignored per-tool
adapters for GitHub Copilot (`.github/agents/`), OpenCode (`.opencode/agents/`),
and Claude Code (`.claude/agents/`). Only the canonical sources are tracked.
Use `bun tools/deploy-agents.mjs` to install the generated adapters into
user-level agent directories for use across workspaces. See `agents/README.md`
for the canonical format, regeneration command, and deployment locations.

## How the layers relate

```
schema + guidance documents   ->  the rules (source of truth)
        machine packs         ->  compact task/category context
        skills                ->  how to perform a task with those rules
        agents                ->  who does the work; composes the skills
```

An agent reads the matching skill; the skill applies the rules from the schema
and guidance documents. Keep that direction: never duplicate guidance into a
skill, or skill steps into an agent.
