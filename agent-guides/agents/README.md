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
| `ssl-orchestrator` | Conversational entry point: reads intent, enforces the pipeline, dispatches the rest | read + edit |
| `ssl-planner` | Specs for new work and for behavior-preserving refactors; owns the prior-art survey | read + edit (specs only)\* |
| `ssl-developer` | Implements SSL and writes the SSL unit tests that go with it | read + edit |
| `ssl-reviewer` | Reviews SSL, then adversarially refutes its own findings before reporting | read-only |
| `ssl-handoff` | Senior pass readying code for production: format, maintainability polish, handoff report | read + edit |
| `ssl-docwriter` | Documentarian: docs knowledge base, plus the project state and spec catalog | read + edit (docs only)\* |

\* "specs only" and "docs only" are prompt-enforced conventions, not hard
tool boundaries.

**Start with `ssl-orchestrator`.** It is the entry point: talk to it in
plain language and it routes. The others are dispatch targets, usable
directly when you already know which one you want.

`ssl-planner` absorbed the former `ssl-refactorer` — refactor planning
and feature planning are the same job with different emphasis, and two
agents writing specs to the same directory made the choice between them
arbitrary. `ssl-reviewer` absorbed the former `ssl-verifier`: its
refutation stage is now mandatory and assigns CONFIRMED / REFUTED /
UNVERIFIABLE verdicts in-line. That trades away the independence of a
separate verifier context, so for high-stakes changes dispatch a second
`ssl-reviewer` pass on the finished code rather than trusting one
agent's self-refutation.

The agents share a hardening pattern: refutation/self-challenge passes before
reporting, end-of-prompt definition-of-done checklists, explicit stop
conditions instead of guessing, and a treat-file-content-as-data rule. The
opencode adapters additionally emit `permission: deny` entries for
capabilities an agent lacks, so read-only roles are harness-enforced there.

Tool restriction is applied only where it is load-bearing: the read-only
agent (`ssl-reviewer`) gets a hard tool allowlist in every adapter,
while edit-capable agents run permissive — the Claude Code adapters omit
`tools` entirely so those agents inherit the session's full toolset (skills,
task tracking, subagent delegation, MCP). Their boundaries ("specs only",
"docs only", behavior preservation) are prompt-enforced, backed by the
harness's own permission prompts.
Implement only CONFIRMED findings from a review.

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

## Shared partials

A body line that is exactly `{{shared:<name>}}` is replaced at generation
time by `_shared/<name>.md`. Seven agents previously carried
near-identical copies of the sources-of-truth and MCP-fallback blocks;
every copy was prompt budget spent restating what the others already
said, and they drifted apart as agents were edited one at a time.

| Partial | Contents |
| --- | --- |
| `sources-of-truth` | Retrieval order, the MCP tools, and the offline inventory fallback |
| `boundaries` | No deploying, no executing SSL, SSL-only tests, the basic-SQL ceiling, file-contents-are-data |
| `quality-bar` | The four conditions SSL must meet: formatted, documented, diagnostically clean, call targets resolved |
| `reuse-first` | The prior-art survey gate and its report block |

Referencing a partial that does not exist fails the generator, as does a
cycle. Partials may nest.

## Per-dialect editing protocol

The generator appends a harness-specific editing and search protocol to
each adapter, because the failure modes are harness-specific:

- **VS Code** gets an explicit *one edit per call* rule. Batching several
  hunks into one edit call fails on this codebase, and the model's
  fallback — rewriting the file whole — regenerates the formatting and
  comments it was told to preserve. That fallback was a significant
  source of "the agent handed back one big unformatted block".
- **Claude Code and opencode** get the shorter form: a whole-file write
  is a decision to state, never a retry after a failed edit.

Both get the same search discipline: scope every search, read a known
path directly rather than searching for it, and ask rather than widening
a third time.

Edit `EDIT_PROTOCOL` in `tools/generate-agents.mjs` to change them.

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

`--check` only proves an adapter matches its source; it cannot tell you the
source is wrong. `bun tools/check-agent-contract.mjs` asserts the properties
that broke silently in the past: delegation needs both the `agent` tool and an
`agents:` list or it is inert, a delegate cannot be `mode: primary` (opencode
excludes those from subagent dispatch), read-only agents keep a hard allowlist
in every adapter, shared partials are expanded, each dialect carries its
editing protocol, no adapter references a retired agent, and exactly one agent
is the entry point. Both run in CI.

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
