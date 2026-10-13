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
   <!-- rules: id=keyword_uppercase,statement_semicolon,no_semicolon_in_comment_text,parameters_first,default_after_parameters,declare_locals_at_start,one_statement_per_line,indent_tabs_preferred,me_base_for_method_calls,doproc_in_class,doproc_for_same_file_procedures,execfunction_for_external_scripts,try_requires_handler,single_catch_per_try,try_and_finally_bodies_not_empty,no_control_exit_in_finally,prefer_exitcase,begincase_requires_case,equals_vs_strict_equals,sql_keyword_case,sql_identifier_case -->
   - Colon-prefixed SSL keywords are uppercase and case-sensitive, for example `:IF` and `:BEGINCASE`.
   - Almost every SSL statement, including comments, must end with a semicolon.
   - Never include a semicolon inside comment text; the first semicolon ends the comment and the remaining text becomes executable code.
   - `:PARAMETERS` must appear before any other statements in a script or procedure body.
   - `:DEFAULT` must immediately follow `:PARAMETERS`.
   - Declare locals at the start of the script or procedure; this is a style preference, because `:DECLARE` is valid anywhere a statement is.
   - Use one statement per line.
   - Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation.
   - Call sibling or inherited methods with `Me:Method()` and `Base:Method()`.
   - Do not call `DoProc` with a bare procedure name inside class methods; it is a compile-time error. Use `Me:Method()` or `Base:Method()`.
   - Use `DoProc("ProcName", {args})` for same-file script procedures.
   - Use `ExecFunction("Category.Script", {args})` or `ExecFunction("Category.Script.Proc", {args})` for external script entry points.
   - `:TRY` requires at least one of `:CATCH` or `:FINALLY`; a bare `:TRY ... :ENDTRY` is invalid.
   - Only one `:CATCH` block is allowed per `:TRY`; there is no multi-catch.
   - The `:TRY` body requires at least one statement, and so does a `:FINALLY` body; a `:CATCH` body may be empty.
   - Do not use `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside `:FINALLY`.
   - End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.
   - `:BEGINCASE` requires at least one `:CASE` block.
   - Use `==` for exact string equality; `=` is prefix-style for strings.
   - Inside SQL strings, write SQL keywords and built-in functions in uppercase.
   - Preserve the author's casing for table names, column names and aliases; force-folding is dialect-conditional (safe on Oracle, but breaks case-sensitive SQL Server collations), so lowercase only Oracle-only code.
   <!-- /rules -->

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
- Other DB functions: use positional `?` with a values array, in the slot the
  signature gives (`LSearch`, `LSelect`, `LSelectC` take it fourth;
  `GetDataSet` second)
- `GetSSLDataset`: use `@name` markers with parallel name and value arrays
- When using array expansion for `IN` clauses, ensure the array is a local variable — UDObject array properties cause a runtime error and must be copied to a local first
- Inside SQL strings, uppercase SQL keywords and functions; preserve the
  author's casing for other SQL identifiers (never force-fold — it breaks
  case-sensitive SQL Server collations)

**Control Flow:**
- Add `:EXITCASE;` as the last statement of `:CASE` and `:OTHERWISE` blocks (unless multi-match behavior is intentional); never nest it inside an `:IF`, which is a compile error
- Replace bare procedure calls with `DoProc("ProcName", {args})`
- Inside class methods, replace any `DoProc` with `Me:Method()`
- Inside class methods, qualify unqualified reads/writes of `:DECLARE` class fields with `Me:fieldName` (or `Base:fieldName` for inherited fields). A bare identifier never touches the field: it follows normal lookup (local, then caller scopes, then publics), so a read can raise `Variable [name] is undefined!` and a write can land on a caller's or a public variable.

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
