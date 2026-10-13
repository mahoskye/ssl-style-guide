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
   and `ssl_refactoring_guide.md` §2.4. SQL data sources may contain builder
   directives (`:DSN`, `:TABLENAME`, etc.). For data sources:
   <!-- rules: id=no_default_statements_in_datasource,no_flag_builder_directives,datasource_not_script_layout -->
   - Data source files use inline `:PARAMETERS` defaults with `:=` instead of separate `:DEFAULT` statements.
   - SQL data-source builder directives are preprocessed before compilation and are not normal SSL keywords.
   - Do not apply normal script `:PARAMETERS`/`:DEFAULT` layout to data-source files.
   <!-- /rules -->

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

**Naming** — bring names in line with:
<!-- rules: id=prefix_matches_type,procedure_class_pascal_case,hungarian_variable_names -->
- Make a variable's prefix match the type of the value it holds: `s` string, `n` numeric, `b` boolean, `d` date, `a` array, `o` object, `fn` code block, `v` variant/any.
- Procedures and classes use PascalCase.
- Variables use Hungarian-style camelCase: a type prefix, then a camelCase body (`sMyVar`, not `s_my_var` or `SMYVAR`).
<!-- /rules -->

**Structure** — move declarations into this order:
<!-- rules: id=parameters_first,default_after_parameters,declare_locals_at_start -->
- `:PARAMETERS` must appear before any other statements in a script or procedure body.
- `:DEFAULT` must immediately follow `:PARAMETERS`.
- Declare locals at the start of the script or procedure; this is a style preference, because `:DECLARE` is valid anywhere a statement is.
<!-- /rules -->
- Ensure procedure ordering is logical

**Error Handling:**
<!-- rules: id=prefer_try_over_error_resume,wrap_execfunction_for_envelope -->
- Prefer `:TRY`/`:CATCH`/`:FINALLY` over legacy `:ERROR`/`:RESUME`.
- When the current boundary promises a stable failure envelope, wrap `ExecFunction` in `:TRY`/`:CATCH` unless the deployed function has a documented no-throw contract, and validate the returned envelope even when the call is wrapped.
<!-- /rules -->

**SQL Safety:**
<!-- rules: id=prevent_sql_injection,named_sql_param_unsupported,sql_positional_placeholders,getssldataset_at_name_markers,udobject_array_in_clause,sql_keyword_case,sql_identifier_case -->
- Prefer parameterized database calls; do not concatenate user or runtime values into SQL when placeholders can bind them.
- `SQLExecute` is the only database API that supports named `?param?` substitution; do not use `?param?` markers with other database functions. Its markers reference in-scope SSL variables by name. Canonical shape: `SQLExecute("UPDATE T SET COL = ?sValue? WHERE ID = ?nId?");`
- `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` use positional `?` markers with a value array in a later argument slot: fourth for `LSearch`, `LSelect` and `LSelectC`, second for `GetDataSet`, and third for `RunSQL` and `LSelect1`. Check `ssl_signature` for the slot and skip unused optionals with adjacent commas. Canonical shape: `aRows := LSelect("SELECT ID FROM T WHERE STATUS = ?",,, {sStatus});`
- `GetSSLDataset` uses `@name` markers with parallel name and value arrays.
- Expand only a local array in `IN (?aValues?)`: a UDObject array property expanded directly raises a runtime error, so copy it to a local first.
- Inside SQL strings, write SQL keywords and built-in functions in uppercase.
- Preserve the author's casing for table names, column names and aliases; force-folding is dialect-conditional (safe on Oracle, but breaks case-sensitive SQL Server collations), so lowercase only Oracle-only code.
<!-- /rules -->

**Control Flow:**
<!-- rules: id=prefer_exitcase,exitcase_last_in_branch,no_direct_procedure_calls,doproc_for_same_file_procedures,doproc_in_class,field_access_via_me -->
- End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.
- `:EXITCASE` must be the last statement of its `:CASE`/`:OTHERWISE` branch, directly in the branch body; one nested inside `:IF`, or followed by another statement, is a compile error.
- Do not call custom script procedures directly as `MyProc()`.
- Use `DoProc("ProcName", {args})` for same-file script procedures.
- Do not call `DoProc` with a bare procedure name inside class methods; it is a compile-time error. Use `Me:Method()` or `Base:Method()`.
- Inside class methods, access fields through `Me:fieldName` or `Base:fieldName`.
<!-- /rules -->

A bare identifier inside a class method never touches a field: it follows
normal lookup (local, then caller scopes, then publics), so a read can raise
`Variable [name] is undefined!` and a write can land on a caller's or a public
variable.

**Comments** — fix any comment or statement that breaks:
<!-- rules: id=no_semicolon_in_comment_text,statement_semicolon -->
- Never include a semicolon inside comment text; the first semicolon ends the comment and the remaining text becomes executable code.
- Almost every SSL statement, including comments, must end with a semicolon.
<!-- /rules -->

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
- Otherwise, verify these by hand:
<!-- rules: id=statement_semicolon,indent_tabs_preferred,member_access_no_spaces,keyword_uppercase -->
- Almost every SSL statement, including comments, must end with a semicolon.
- Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation.
- Prefer no spaces around `:` in member access even though SSL accepts spaced forms.
- Colon-prefixed SSL keywords are uppercase and case-sensitive, for example `:IF` and `:BEGINCASE`.
<!-- /rules -->

### Step 5 — VALIDATE
- **If MCP `ssl_diagnose` is available, run it on the edited file and require zero errors before finishing** — it runs the real starlims-lsp validator and is authoritative over the manual checks below. Treat the remaining bullets as the fallback when the MCP is absent.
- Confirm all procedures are complete — no stubs or `// TODO` placeholders
- Verify that these hold:
<!-- rules: id=try_requires_handler,single_catch_per_try,no_control_exit_in_finally,begincase_requires_case -->
- `:TRY` requires at least one of `:CATCH` or `:FINALLY`; a bare `:TRY ... :ENDTRY` is invalid.
- Only one `:CATCH` block is allowed per `:TRY`; there is no multi-catch.
- Do not use `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside `:FINALLY`.
- `:BEGINCASE` requires at least one `:CASE` block.
<!-- /rules -->
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
