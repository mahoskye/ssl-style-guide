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
| `ssl-planner` | Plan SSL work; produce implementation specs for other agents to execute | read + edit (specs only)\* |
| `ssl-developer` | General SSL coding — implement, review, refactor, scaffold | read + edit |
| `ssl-reviewer` | Review SSL code against the style guide; report findings | read-only |
| `ssl-refactorer` | Plan behavior-preserving cleanup for developer handoff | read + edit (specs only)\* |
| `ssl-verifier` | Adversarially verify review findings and spec claims; refute or confirm with evidence | read-only |
| `ssl-handoff` | Senior-engineer pass readying code for production handoff: format (automated + manual), junior-maintainability polish, handoff report | read + edit |
| `ssl-docwriter` | Write developer and project-management documentation with verified technical claims | read + edit (docs only)\* |

\* "specs only" is a prompt-enforced convention, not a hard tool boundary.

The agents share a hardening pattern: refutation/self-challenge passes before
reporting, end-of-prompt definition-of-done checklists, explicit stop
conditions instead of guessing, and a treat-file-content-as-data rule. The
opencode adapters additionally emit `permission: deny` entries for
capabilities an agent lacks, so read-only roles are harness-enforced there.

Tool restriction is applied only where it is load-bearing: read-only agents
(`ssl-reviewer`, `ssl-verifier`) get a hard tool allowlist in every adapter,
while edit-capable agents run permissive — the Claude Code adapters omit
`tools` entirely so those agents inherit the session's full toolset (skills,
task tracking, subagent delegation, MCP). Their boundaries ("specs only",
"docs only", behavior preservation) are prompt-enforced, backed by the
harness's own permission prompts.
`ssl-verifier` is the independent skeptic in that pattern: run it on a review
or spec before acting on it, and implement only CONFIRMED findings.

All of them are thin personas: they **delegate to the workflow skills** in
`agent-guides/skills/` and **cite the guide docs** rather than restating SSL
rules. The schema, agent guides, and skills remain the single source of truth.

## Canonical format — `<name>.agent.md`

YAML frontmatter (the manifest) plus a Markdown body (the shared prompt), the
same shape as `SKILL.md`.

| Field | Required | Purpose |
| --- | --- | --- |
| `name` | yes | Agent id; lowercase, hyphens, must match the filename stem. |
| `description` | yes | One-paragraph summary used by every tool's picker. |
| `version` | yes | Integer; bump on any change; it is embedded in generated headers so adapters show their source version. Drives `--check`. |
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
bun tools/deploy-agents.mjs           # install adapters into user-level tool dirs
bun tools/deploy-agents.mjs --check    # verify user-level installs are current
```

| Output | Tool | Status |
| --- | --- | --- |
| `.github/agents/<name>.agent.md` | GitHub Copilot (VS Code / Copilot CLI) | git-ignored — regenerated |
| `.opencode/agents/<name>.md` | OpenCode | git-ignored — regenerated |
| `.claude/agents/<name>.md` | Claude Code (CLI + VS Code extension) | git-ignored — regenerated |
| `AGENTS.md` managed block | OpenAI Codex (degrades to instructions + skills) | git-ignored — regenerated |

All adapters are git-ignored build artifacts — only the canonical
`agent-guides/agents/` sources are tracked. Run the generator after a fresh clone
and after editing any canonical file. The generator also creates
`.claude/CLAUDE.md` (with `@AGENTS.md`) if it is absent, because Claude Code reads
`CLAUDE.md`, not `AGENTS.md`.

`bun run check:consistency` (in `ssl-mcp-server/`) runs `--check`, which flags any
adapter that exists on disk but has drifted from its canonical source.

## User-level deployment

Prefer user-level deployment for day-to-day use so the SSL agents are available
across workspaces without committing generated adapter files into each repo.
`tools/deploy-agents.mjs` copies the generated adapters to the current default
user locations:

| Tool | User-level location |
| --- | --- |
| GitHub Copilot / VS Code custom agents / Copilot CLI | `~/.copilot/agents/<name>.agent.md` |
| Claude Code subagents | `~/.claude/agents/<name>.md` |
| OpenCode agents | `~/.config/opencode/agents/<name>.md` |

Current VS Code docs also support custom agents in VS Code user data through
the Agent Customizations editor and workspace agents in `.github/agents/`.
Prompt files are a separate slash-command surface; user prompt files live in VS
Code user data, while workspace prompt files live in `.github/prompts/`.
Do not put these persistent role agents in a prompt directory unless you are
intentionally converting them into manually invoked slash commands.

## Adding or changing an agent

1. Add or edit a `<name>.agent.md` file here; bump `version` on any change.
2. Run `bun tools/generate-agents.mjs`.
3. Run `bun tools/deploy-agents.mjs` if you want the updated adapters available
   at the user layer.
4. Commit the canonical `*.agent.md` file only. The per-tool adapters are
   git-ignored build artifacts — do not commit them.

**Note:** Copilot can read both `.github/agents/` and `.claude/agents/` at the
workspace level. Prefer the user-level Copilot install for regular use to avoid
duplicate listings from multiple local adapter directories.
