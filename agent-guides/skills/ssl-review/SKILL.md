---
name: ssl-review
description: Review SSL code against the style guide and language rules. Use when asked to review, lint, or check SSL code quality.
argument-hint: "<file-path> [focus: naming|formatting|error_handling|sql|security|inventory|all]"
allowed-tools: Read, Grep, Glob, mcp__ssl-reference__ssl_lookup, mcp__ssl-reference__ssl_search, mcp__ssl-reference__ssl_diagnose, mcp__ssl-reference__ssl_style_rule
---

Review the SSL file at `$ARGUMENTS` (first token is the file path, optional second token is the focus area).

## Instructions

1. **Parse arguments:** Extract `<file-path>` as `$0` and optional `[focus]` as `$1` (default: `all`).
   - If no file path is given, ask the user for the file path before continuing.

2. **Read the file** at the given path using the Read tool.

3. **If MCP `ssl_diagnose` is available, run it first** and fold its JSON diagnostics into the report as authoritative errors/warnings (it runs starlims-lsp `--validate --info`, including `:INCLUDE`-aware undeclared-variable analysis). Info-severity rows are advisory style observations and idiom notes — report them as suggestions, not violations. Then apply the style/security checks below, which the LSP does not cover. If the MCP is unavailable, apply all checks below manually.

4. **Apply the checks below** according to the focus area. For `all`, run every check.

5. **Identify the file type** before applying rules. If the file is a data source (SSL or SQL),
   parameter syntax and structure rules differ — see `ssl_agent_instructions.md` §4A:
   - Data sources use `:PARAMETERS p1 := val;` (inline defaults), not separate `:DEFAULT` statements
   - SQL data sources may contain builder directives (`:DSN`, `:TABLENAME`, `:NULLASBLANK`, `:INVARIANTDATECOLUMNS`) — do not flag these
   - Do not apply the standard script layout order to data source files

6. **Use these core SSL rules while reviewing** (for server scripts and class files):
   - Colon-prefixed keywords must be UPPERCASE
   - Almost every statement, including comments, must end with `;`
   - Never place `;` inside comment body text
   - `:PARAMETERS` must come immediately after `:PROCEDURE`
   - `:DEFAULT` must come immediately after `:PARAMETERS`
   - `:DECLARE` must appear before body statements
   - Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation
   - `DoProc` is invalid inside class methods; use `Me:` / `Base:`
   - `:TRY` requires at least one `:CATCH` or `:FINALLY`; only one `:CATCH` per `:TRY` (no multi-catch)
   - `:TRY` body requires at least one statement; `:FINALLY` body (if present) requires at least one statement; `:CATCH` body allows zero or more statements
   - `:RETURN`, `:EXITFOR`, `:EXITWHILE`, and `:LOOP` inside a `:FINALLY` block are rejected
   - `:BEGINCASE` requires at least one `:CASE`
   - Use one statement per line
   - Use `DoProc("ProcName", {args})` for same-file procedures; `ExecFunction` for external
   - Inside SQL strings, uppercase SQL keywords; keep other identifiers lowercase
   - End each `:CASE` / `:OTHERWISE` with `:EXITCASE;` unless multi-match is intentional
   - `==` is exact string equality; `=` is prefix matching for strings

---

## Check Categories

### `naming` — Hungarian notation and identifier conventions
- Prefix mismatch: `s` = string, `n` = numeric, `b` = boolean, `d` = date,
  `a` = array, `o` = object, `fn` = code block, `v` = variant/any
- Identifiers should be camelCase after the prefix (`sMyVar`, not `s_my_var` or `SMYVAR`)
- Class names should be PascalCase
- Procedure names should be PascalCase (e.g., `GetInvoiceTotal`)
- Constants should use UPPER_SNAKE_CASE

### `formatting` — Syntax and structural formatting
- Every statement (including comments) must end with `;`
- Keywords must be UPPERCASE colon-prefixed: `:IF`, `:ENDIF`, `:FOR`, `:NEXT`, `:WHILE`, `:ENDWHILE`, `:BEGINCASE`, `:ENDCASE`, etc.
- Indentation: prefer tabs; if the file already uses spaces, preserve consistent
  4-space indentation and flag mixed indentation
- No space around `:` in member access (`Me:Method()`, not `Me : Method()`)
- `:DECLARE` placement before body statements is a suggestion-severity style check, not a language rule — the language allows `:DECLARE` anywhere in statement flow. `:PARAMETERS` must come before other statements.
- `:DEFAULT` must immediately follow `:PARAMETERS`

### `error_handling` — Error handling patterns
- Flag use of legacy `:ERROR` / `:RESUME` — prefer `:TRY` / `:CATCH` / `:ENDTRY`
- Verify `:TRY` blocks have at least one `:CATCH` or `:FINALLY`
- Flag multiple `:CATCH` blocks on a single `:TRY` (only one allowed)
- Flag `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside a `:FINALLY` block (rejected)
- Flag empty `:CATCH` blocks (swallowed errors) unless intentional
- Flag missing `:TRY` around external calls (`ExecFunction`, `SQLExecute`, DB functions)

### `sql` — SQL construction and parameterization
- Flag string concatenation in SQL queries (injection risk): `"SELECT ... " + sVar`
- `SQLExecute`: must use `?varName?` substitution for parameters
- `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, `GetDataSet`: use positional `?` with explicit parameter arrays
- Flag UDObject array properties used directly in `IN (?obj:prop?)` expansion — must copy to local variable first (runtime error: "The current array has more than 1 dimmension.")
- Flag direct variable embedding in SQL strings
- Flag SQL strings that do not uppercase SQL keywords/functions or that
  uppercase non-keyword identifiers without an external casing requirement

### `security` — Security-relevant patterns
- SQL injection (see `sql` checks above)
- Hardcoded credentials, passwords, or connection strings
- Unvalidated user input passed to DB functions or `ExecFunction`
- Overly broad error suppression

### `inventory` — Cross-reference against the published SSL element inventory

Use `ssl-style-guide/ssl-element-reference.json` (or MCP tools `ssl_lookup`
and `ssl_search` when available) to validate identifiers. The JSON contains
all 460 published SSL elements: 38 keywords, 32 operators, 3 literals, 8
types, 29 classes, 8 special forms, 12 return objects, 330 functions.

- **Removed/unknown built-in functions:** Flag any call that looks like a
  built-in function (PascalCase identifier, not accessed as a member through
  any object or value — `Me:`, `Base:`, or `var:Member()` (.NET member
  passthrough on built-in value types is legitimate), not declared in this
  file, not invoked via `DoProc` / `ExecFunction`) but that does not appear in
  the JSON's `functions` bucket. Several previously-
  documented functions are no longer in the published reference, including:
  `LPrint`, `TraceOn` / `TraceOff`, `SqlTraceOn` / `SqlTraceOff`,
  `StationName`, `UndeclaredVars`, `In64BitMode`, `NetFrameworkVersion`,
  `GetExecutionTrace`, `SetLocationOracle` / `SetLocationSQLServer`,
  `GetForbiddenAppIDs` / `GetForbiddenDesignerAppIDs`, and the licensing
  helpers (`IsFeatureAuthorized`, `IsFeatureBasedLicense`, `IsDemoLicense`,
  `GetLicenseInfoAsText`, `ResetFeatures`, `GetInstallationKey`,
  `GetFeaturesAndNumbers`, `GetNumberOfInstrumentConnections`,
  `GetNumberOfNamedConcurrentUsers`, `GetNumberOfNamedUsers`). Flag these
  as warnings — recommend the user verify the function still exists in
  their STARLIMS version and find a supported replacement. (Verify with
  `ssl_lookup` — the authoritative inventory; this list may lag it.)
- **Built-in class collisions:** Flag any `:CLASS Foo;` declaration where
  `Foo` matches a built-in class name (`AzureStorage`, `Email`,
  `SQLConnection`, `SSLError`, `SSLDataset`, `WebServices`, etc.).
- **Argument-count mismatches:** For calls to documented built-in functions
  with a `parameters` table in the JSON, count required vs. optional
  parameters. Flag calls that pass fewer arguments than required or far
  more than the documented arity.
- **Unknown keywords or operator symbols:** Flag colon-prefixed tokens or
  operator symbols not present in the inventory.

### `all` — Run all of the above

---

## Additional Checks (always applied)

- **Semicolons in comments:** `/* comment text;` — a `;` inside comment text ends the comment prematurely, turning the rest into executable code. Flag any `/* ... ; ...` where the semicolon is inside the comment body, not at the end.
- **Missing `:EXITCASE`:** Each `:CASE` / `:OTHERWISE` block should end with `:EXITCASE;` unless multi-match behavior is intentional (without `:EXITCASE`, later `:CASE` expressions are still evaluated and additional matching bodies may execute, but `:OTHERWISE` stays skipped once any earlier case body has run).
- **Undeclared variables:** Variables used before a `:DECLARE` in the same procedure scope. Before flagging, check for (a) an `:INCLUDE` — included scripts are spliced in full and may declare the variable; (b) `:PUBLIC` — publics are call-stack scoped and may be established by a caller. Downgrade such cases to a note, not an error. (MCP `ssl_diagnose` handles (a) automatically.)
- **Bare procedure calls:** Direct calls to custom procedure names without `DoProc()` or `ExecFunction()`.
- **`DoProc` in class methods:** `DoProc` is rejected inside `:CLASS` methods — use `Me:Method()` instead.
- **Unqualified class field access:** Inside a `:CLASS` method, any read or write of a name that appears in the class's `:DECLARE` list (and is not also a local or `:PARAMETERS` name) must be qualified with `Me:` (or `Base:` for an inherited field). A bare identifier creates/uses a local instead and silently leaves the field unchanged.
- **`=` vs `==` for string equality:** `=` is prefix match for strings; `==` is exact equality. Flag `=` used where exact string comparison is likely intended. Note: `!=` negates `==` (strict), not `=` (prefix), so `=` and `!=` are **not** logical opposites for strings.

---

## Output

Report findings grouped by category. For each finding:

```
[CATEGORY] Line N: <description>
  Code: <the offending line>
  Fix:  <suggested correction>
```

At the end, provide a summary:
```
Summary: N issues found (X errors, Y warnings, Z suggestions)
```

Use **error** for language violations, **warning** for likely bugs or legacy patterns, **suggestion** for style improvements.

If no issues are found in a category, note "No issues found."

---

## References

- Compact machine packs: `agent-guides/machine/foundation.md` +
  `agent-guides/machine/categories/` (via `category-index.json` or MCP
  `ssl_context_pack`) — prefer these over the full narrative guides.
- `ssl-style-guide/ssl-style-guide.schema.yaml` and
  `agent-guides/ssl_agent_instructions.md` — the canonical rules and narrative
  reference, when the packs lack detail.
