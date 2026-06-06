# SSL Agents

Canonical, tool-neutral definitions for the SSL developer agents. Each agent is
authored **once** here and a generator emits thin per-tool adapter files for
GitHub Copilot, opencode, OpenAI Codex, and Claude Code.

There is no single cross-tool "agent" format: `AGENTS.md` standardizes *project
instructions* and `SKILL.md` is converging for *skills*, but agent/subagent
frontmatter genuinely differs per tool. So this directory holds the single
source of truth, and `tools/generate-agents.mjs` maps it to each dialect.

## Agents

| Agent | Role | Tools |
| --- | --- | --- |
| `ssl-planner` | Plan SSL work; produce implementation specs for other agents to execute | read + edit (specs only) |
| `ssl-developer` | General SSL coding — implement, review, refactor, scaffold | read + edit |
| `ssl-reviewer` | Review SSL code against the style guide; report findings | read-only |
| `ssl-refactorer` | Plan behavior-preserving cleanup for developer handoff | read + edit (specs only) |

All four are thin personas: they **delegate to the workflow skills** in
`agent-guides/skills/` and **cite the guide docs** rather than restating SSL
rules. The schema, agent guides, and skills remain the single source of truth.

## Canonical format — `<name>.agent.md`

YAML frontmatter (the manifest) plus a Markdown body (the shared prompt), the
same shape as `SKILL.md`.

| Field | Required | Purpose |
| --- | --- | --- |
| `name` | yes | Agent id; lowercase, hyphens, must match the filename stem. |
| `description` | yes | One-paragraph summary used by every tool's picker. |
| `version` | yes | Integer; bump on any manifest/body change. Drives `--check`. |
| `mode` | no | `primary` \| `subagent` \| `all` (opencode vocabulary; default `all`). |
| `argument-hint` | no | Invocation hint, e.g. `"<file-path> [focus]"`. |
| `model` | no | `inherit` (default — omitted per tool) or a concrete model id. |
| `tools` | yes | Neutral capability tokens: `read`, `edit`, `grep`, `glob`, `bash:read-only`. |
| `mcp` | no | MCP servers/tools the agent expects: `- server: <name>` / `tools: [...]`. |
| `skills` | no | Workflow skills (`agent-guides/skills/<name>/`) the agent composes. |
| `guides` | no | Guide/schema paths the body relies on; the generator checks they exist. |
| `handoffs` | no | Suggested next-step agents (VS Code Copilot only). List of `{ label, agent, prompt?, send?, model? }`. Target `agent` must be a canonical agent in this directory. |
| `overrides` | no | Per-tool frontmatter escape hatch: `overrides.<tool>: { ... }`. |

The body is emitted **verbatim** into every adapter (with a generated-file
header), so write it tool-neutrally — reference skills by their
`agent-guides/skills/<name>/SKILL.md` path, which works in every tool.

## Generated adapters

Run from the repo root after a fresh clone and after editing any canonical file:

```bash
bun tools/generate-agents.mjs          # write adapters
bun tools/generate-agents.mjs --check  # verify adapters are in sync (no writes)
```

| Output | Tool | Status |
| --- | --- | --- |
| `.github/agents/<name>.agent.md` | GitHub Copilot (VS Code) | git-ignored — regenerated |
| `.opencode/agent/<name>.md` | opencode | git-ignored — regenerated |
| `.claude/agents/<name>.md` | Claude Code (CLI + VS Code extension) | git-ignored — regenerated |
| `AGENTS.md` managed block | OpenAI Codex (degrades to instructions + skills) | git-ignored — regenerated |

All adapters are git-ignored build artifacts — only the canonical
`agent-guides/agents/` sources are tracked. Run the generator after a fresh clone
and after editing any canonical file. The generator also creates
`.claude/CLAUDE.md` (with `@AGENTS.md`) if it is absent, because Claude Code reads
`CLAUDE.md`, not `AGENTS.md`.

`bun run check:consistency` (in `ssl-mcp-server/`) runs `--check`, which flags any
adapter that exists on disk but has drifted from its canonical source.

## Adding or changing an agent

1. Add or edit a `<name>.agent.md` file here; bump `version` on any change.
2. Run `bun tools/generate-agents.mjs`.
3. Commit the canonical `*.agent.md` file only. The per-tool adapters are
   git-ignored build artifacts — do not commit them.

**Note:** Copilot reads both `.github/agents/` and `.claude/agents/`. Both are
git-ignored and regenerated locally; a developer who has both populated may see
the agent listed twice in Copilot.
