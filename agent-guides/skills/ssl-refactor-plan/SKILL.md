---
name: ssl-refactor-plan
description: Plan an SSL refactor and write a behavior-preserving implementation spec for ssl-developer. Use when a refactor is large or risky enough to plan before editing, or when asked to plan/spec an SSL refactor without changing code.
argument-hint: "<file-path> [goal] [target-spec-path]"
allowed-tools: Read, Write, Edit, Grep, Glob, mcp__ssl-reference__ssl_lookup, mcp__ssl-reference__ssl_signature, mcp__ssl-reference__ssl_search, mcp__ssl-reference__ssl_context_pack
---

Plan a behavior-preserving refactor for the SSL file at `$ARGUMENTS`.

## Instructions

1. **Parse arguments:** Extract `<file-path>` as `$0`, optional `[goal]` as the
   remaining text, and optional explicit spec path if the user provides one.
   If no file path is given, ask the user before continuing.

2. **Read the required references before planning:**
   - Compact machine packs: `agent-guides/machine/foundation.md` +
     `agent-guides/machine/categories/` (via `category-index.json` or MCP
     `ssl_context_pack`) — prefer these over the full narrative guides.
   - `ssl-style-guide/ssl-style-guide.schema.yaml`
   - `agent-guides/ssl_refactoring_guide.md` and
     `agent-guides/ssl_agent_instructions.md` — the narrative guides, when the
     packs lack detail.

3. **Identify the file type** before proposing changes. If the file is a data
   source (SSL or SQL), it uses different parameter syntax and structure:
   - Data sources use `:PARAMETERS p1 := val;`, not separate `:DEFAULT`
   - SQL data sources may contain builder directives (`:DSN`, `:TABLENAME`,
     `:NULLASBLANK`, `:INVARIANTDATECOLUMNS`)
   - Do not apply the standard script layout to data source files

4. **Study the code before writing the spec:**
   - Read the entire target file
   - Identify procedures, classes, parameters, declarations, and external
     interfaces
   - Note internal calls (`DoProc`, `Me:`, `Base:`) and external calls
     (`ExecFunction`, database APIs)
   - Note `:INCLUDE` targets and `:PUBLIC` declarations — included scripts are
     spliced in full and `:PUBLIC` variables are call-stack scoped, so the
     file's real symbol surface may extend beyond its own text; record these in
     the spec's Current behavior section
   - Confirm built-in functions, classes, keywords, and operators with the
     `ssl-lookup` workflow, preferring MCP lookup tools when available

5. **Classify proposed changes:**
   - Safe mechanical cleanup: formatting, keyword casing, comments, declaration
     ordering, obvious member-access qualification
   - Behavior-sensitive cleanup: error-handling modernization, SQL
     parameterization, procedure extraction, call-shape changes, changed
     defaults, renamed external entry points
   - Do not approve behavior-sensitive cleanup silently; put it in the spec
     with verification notes and open questions

6. **Write the spec** to `specs/refactor-<kebab-file-or-goal>.md` by default
   unless the user provided a target path.

## Spec Format

Write a self-contained Markdown document with these sections, in order:

1. **Goal** — what should be refactored and why.
2. **Target file** — path, SSL file type, public entry points, and indentation
   style observed.
3. **Current behavior** — concise summary of inputs, outputs, side effects,
   persistence touchpoints, and dependencies.
4. **Refactor plan** — ordered edits the developer should make. Separate safe
   mechanical changes from behavior-sensitive changes.
5. **SSL rule checks** — rules from the schema and guides that apply to this
   file, including data-source exceptions if relevant.
6. **Built-in element checks** — functions, classes, keywords, and operators
   verified through MCP or local inventory. Note any unresolved lookups.
7. **Validation plan** — exact checks the developer should run after editing.
   Always include: run MCP `ssl_diagnose` on the edited file and require zero
   errors (fallback if the MCP is unavailable: the manual checklist in
   `ssl_refactoring_guide.md` Part 8); plus any file-specific behavioral checks.
8. **Open questions** — risks, ambiguities, or behavior changes that require
   user confirmation.
9. **Developer handoff** — short paragraph instructing `ssl-developer` to
   implement the spec, preserve behavior, verify the listed checks, and report
   unresolved issues.

## Constraints

- Do not edit production SSL files.
- Do not invent signatures, keywords, classes, or function behavior.
- Preserve external interfaces unless the user explicitly requested a change.
- Keep the plan concrete enough that another agent can implement it without
  relying on prior chat context.
