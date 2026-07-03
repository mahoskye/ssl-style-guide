---
name: ssl-refactor
description: Refactor SSL code following the SSL refactoring guide. Use when asked to refactor, modernize, or clean up SSL code.
argument-hint: "<file-path> [goal]"
allowed-tools: Read, Write, Edit, Grep, Glob, mcp__ssl-reference__ssl_lookup, mcp__ssl-reference__ssl_format, mcp__ssl-reference__ssl_diagnose
---

Refactor the SSL file at `$ARGUMENTS` (first token is the file path, optional remaining text is the refactoring goal).

## Instructions

1. **Parse arguments:** Extract `<file-path>` as `$0` and optional `[goal]` as the remaining text (e.g., "modernize error handling", "fix naming", "all").
   - If no file path is given, ask the user before continuing.
   - If the file is large, has many external entry points, or the goal involves behavior-sensitive changes, suggest running `ssl-refactor-plan` first and implementing from the spec instead of editing directly.

2. **Identify the file type** before refactoring. If the file is a data source (SSL or SQL),
   it uses different parameter syntax and structure — see `ssl_agent_instructions.md` §4A
   and `ssl_refactoring_guide.md` §2.4:
   - Data sources use `:PARAMETERS p1 := val;` (inline defaults), not separate `:DEFAULT`
   - SQL data sources may contain builder directives (`:DSN`, `:TABLENAME`, etc.)
   - Do not apply the standard script layout (§2.1) to data source files

3. **Use these core SSL rules throughout the refactor** (for server scripts and class files):
   - Colon-prefixed keywords must be UPPERCASE: `:IF`, `:TRY`, `:PROCEDURE`, etc.
   - Almost every statement, including comments, must end with `;`
   - Never place `;` inside comment body text; it ends the comment early
   - `:PARAMETERS` must come immediately after `:PROCEDURE`
   - `:DEFAULT` must come immediately after `:PARAMETERS`
   - `:DECLARE` before body statements is a style preference — the language allows `:DECLARE` anywhere in statement flow
   - Use one statement per line
   - Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation
   - Use `Me:Method()` / `Base:Method()` inside classes; `DoProc` is invalid inside class methods
   - Use `DoProc("ProcName", {args})` for same-file script procedures
   - Use `ExecFunction("Category.Script", {args})` or
     `ExecFunction("Category.Script.Proc", {args})` for external entry points
   - `:TRY` requires at least one `:CATCH` or `:FINALLY`; only one `:CATCH` per `:TRY`
   - `:TRY` body requires at least one statement; `:FINALLY` body (if present) requires at least one statement
   - `:RETURN`, `:EXITFOR`, `:EXITWHILE`, and `:LOOP` inside a `:FINALLY` block are rejected
   - End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional
   - `:BEGINCASE` requires at least one `:CASE` block
   - Use `==` for exact string equality; `=` is prefix matching for strings
   - Inside SQL strings, use uppercase SQL keywords and functions; keep other SQL
     identifiers lowercase unless external schema/object casing must be preserved

4. **Apply the 6-step workflow:**

---

## Workflow

### Step 1 — STUDY
- Read the entire target file
- Identify all procedures and their relationships
- Note external calls (`ExecFunction`) and internal calls (`DoProc`)
- Note any `:INCLUDE` lines — the target script is spliced in full before execution, so variables/procedures it declares are in scope here; never flag or 'fix' their uses as undeclared, and don't relocate `:INCLUDE` lines during cleanup.
- Understand what the code does before changing anything

### Step 2 — PLAN
- Document what changes you will make (list them explicitly)
- If a `[goal]` was provided, focus on that area while maintaining overall correctness
- Flag any risky changes (changes to external interface, behavioral changes) for user review

### Step 3 — REFACTOR
Apply changes in this priority order (or focus on `[goal]` if specified):

**Naming:**
- Apply Hungarian notation: `s` string, `n` numeric, `b` boolean, `d` date,
  `a` array, `o` object, `fn` code block, `v` variant/any
- Rename procedures to PascalCase
- Rename variables to camelCase with correct prefix

**Structure:**
- Move `:PARAMETERS` immediately after `:PROCEDURE`
- Move `:DEFAULT` immediately after `:PARAMETERS`
- Moving `:DECLARE` before body statements is a style preference — the language allows `:DECLARE` anywhere in statement flow
- Ensure procedure ordering is logical

**Error Handling:**
- Replace `:ERROR` / `:RESUME` with `:TRY` / `:CATCH` / `:ENDTRY`
- Wrap external calls in `:TRY` blocks where appropriate

**SQL Safety:**
- Replace string concatenation in SQL with proper parameterization
- `SQLExecute`: use `?varName?` substitution
- Other DB functions: use positional `?` with parameter arrays
- When using array expansion for `IN` clauses, ensure the array is a local variable — UDObject array properties cause a runtime error and must be copied to a local first
- Inside SQL strings, uppercase SQL keywords and functions; keep other SQL
  identifiers lowercase unless external schema/object casing must be preserved

**Control Flow:**
- Add `:EXITCASE;` at end of `:CASE` and `:OTHERWISE` blocks (unless multi-match behavior is intentional)
- Replace bare procedure calls with `DoProc("ProcName", {args})`
- Inside class methods, replace any `DoProc` with `Me:Method()`
- Inside class methods, qualify unqualified reads/writes of `:DECLARE` class fields with `Me:fieldName` (or `Base:fieldName` for inherited fields). A bare identifier creates a local instead of touching the field.

**Comments:**
- Fix comments that contain `;` in the comment body text (move semicolon to end only)
- Ensure all statements (including comments) end with `;`

**Inventory cross-check:**
- Cross-reference built-in function calls against
  `ssl-style-guide/ssl-element-reference.json` (or MCP `ssl_lookup`).
- Flag any call to a function that does not appear in the inventory's
  `functions` bucket. The published reference no longer documents these
  functions: `LPrint`, `TraceOn` / `TraceOff`, `SqlTraceOn` / `SqlTraceOff`,
  `StationName`, `UndeclaredVars`, `In64BitMode`, `NetFrameworkVersion`,
  `GetExecutionTrace`, `SetLocationOracle` / `SetLocationSQLServer`,
  `GetForbiddenAppIDs` / `GetForbiddenDesignerAppIDs`, and the licensing
  helpers (`IsFeatureAuthorized`, `IsFeatureBasedLicense`, `IsDemoLicense`,
  `GetLicenseInfoAsText`, `ResetFeatures`, `GetInstallationKey`,
  `GetFeaturesAndNumbers`, `GetNumberOfInstrumentConnections`,
  `GetNumberOfNamedConcurrentUsers`, `GetNumberOfNamedUsers`).
- Do not silently rewrite or delete these calls — surface them to the user
  as flagged TODOs with a note that the function is no longer in the
  published reference and may have been removed from current STARLIMS
  versions. (Verify with `ssl_lookup` — the authoritative inventory; this
  list may lag it.)

### Step 4 — FORMAT
- If MCP `ssl_format` is available, run it instead of hand-formatting; then only verify embedded-SQL style manually.
- Verify all statements end with `;`
- Preserve the file's indentation style: prefer tabs, or preserve existing
  4-space indentation
- No spaces around `:` in member access
- Uppercase all colon-prefixed keywords

### Step 5 — VALIDATE
- **If MCP `ssl_diagnose` is available, run it on the edited file and require zero errors before finishing** — it runs the real starlims-lsp validator and is authoritative over the manual checks below. Treat the remaining bullets as the fallback when the MCP is absent.
- Confirm all procedures are complete — no stubs or `// TODO` placeholders
- Verify `:TRY` blocks each have at least one `:CATCH` or `:FINALLY` (and at most one `:CATCH`)
   - Verify no `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside `:FINALLY` blocks
- Verify `:BEGINCASE` blocks have at least one `:CASE`
- Verify behavior is preserved (same external interface, same logic)

### Step 6 — DOCUMENT
- Summarize changes made at the end of your response
- Note any behaviors that were preserved intentionally
- Flag any areas where you were unsure and explain the decision made

---

## Output

Produce the complete refactored file — no stubs, no partial implementations. Write the file using the Write or Edit tool.

If the file is large or the changes are extensive, edit procedure by procedure and confirm with the user before writing if behavior-changing modifications are required.

After writing, provide a concise change summary:
```
Refactoring complete. Changes made:
- [list of changes]
Preserved:
- [list of intentionally unchanged behaviors]
```

---

## References

- Compact machine packs: `agent-guides/machine/foundation.md` +
  `agent-guides/machine/categories/` (via `category-index.json` or MCP
  `ssl_context_pack`) — prefer these over the full narrative guides.
- `agent-guides/ssl_refactoring_guide.md` and
  `agent-guides/ssl_agent_instructions.md` — the narrative guides, when the
  packs lack detail.
