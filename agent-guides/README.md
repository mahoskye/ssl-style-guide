# Agent Guides

Agent-facing material for working with STARLIMS SSL (v11) in this repository.
Three layers, from reference to ready-to-run:

| Layer | Path | What it is |
| --- | --- | --- |
| **Guidance documents** | `ssl_agent_instructions.md`, `ssl_refactoring_guide.md` | Detailed SSL language reference and the refactoring workflow. |
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

## Skills

`skills/` contains six SSL workflow skills, each a `SKILL.md` with frontmatter
plus step-by-step instructions:

- `ssl-lookup` — look up a function signature, class member, or keyword
- `ssl-review` — review SSL code against the style guide and language rules
- `ssl-refactor` — refactor SSL code following the refactoring guide
- `ssl-refactor-plan` — plan behavior-preserving refactors for implementation
- `ssl-format` — format SSL code and embedded SQL in canonical compact style
- `ssl-new-procedure` — scaffold a new SSL procedure
- `ssl-new-class` — scaffold a new SSL class

In Claude Code and opencode these are registered skills an agent can invoke
directly; in other tools they are Markdown files an agent reads and follows.

## Agents

`agents/` contains the canonical, tool-neutral definitions for four SSL
developer agents:

- `ssl-developer` — general SSL coding: implement, review, refactor, scaffold
- `ssl-reviewer` — review SSL code against the style guide (read-only)
- `ssl-refactorer` — plan behavior-preserving cleanup for developer handoff

Each agent is a thin persona: it delegates to the skills above and cites the
guidance documents rather than carrying its own copy of the rules. Each agent is
authored once here; `tools/generate-agents.mjs` emits git-ignored per-tool
adapters for GitHub Copilot (`.github/agents/`), opencode (`.opencode/agent/`),
and Claude Code (`.claude/agents/`). Only the canonical sources are tracked, so
run the generator after a fresh clone. See `agents/README.md` for the canonical
format and the regeneration command.

## How the layers relate

```
schema + guidance documents   ->  the rules (source of truth)
        skills                ->  how to perform a task with those rules
        agents                ->  who does the work; composes the skills
```

An agent reads the matching skill; the skill applies the rules from the schema
and guidance documents. Keep that direction: never duplicate guidance into a
skill, or skill steps into an agent.
