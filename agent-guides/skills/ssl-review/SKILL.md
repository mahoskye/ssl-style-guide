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

3. **If MCP `ssl_diagnose` is available, run it first** and fold its JSON diagnostics into the report as authoritative errors/warnings. It runs the strict agent profile, starlims-lsp `--validate --info --hungarian-types --strict`. Treat errors and warnings as must-fix. `--strict` adds three warnings an editor withholds: `undeclared_variable` (usually a typo'd read, invisible to a default run), `unused_variable` (hint severity), and `invalid_sql_param`. `hungarian_type_mismatch` is a real type signal — the prefix a name declares disagrees with what its expression produces — and is worth reporting. Info-severity rows are advisory style observations and idiom notes — report them as suggestions, not violations. The naming-convention audit (`hungarian_notation`) is not run; if you are reviewing newly written code and want it, check prefixes against the convention yourself. Then apply the style/security checks below, which the LSP does not cover. If the MCP is unavailable, apply all checks below manually.

   **`ssl_diagnose` does not resolve `:INCLUDE`.** Include-aware analysis needs a workspace closure that only the editor language server builds; the command-line path the MCP uses validates one document in isolation. So in a file with an `:INCLUDE`, an `undeclared_variable` warning may name a variable the included script declares. Check the include target yourself before reporting one as a defect.

4. **Apply the checks below** according to the focus area. For `all`, run every check.

5. **Identify the file type** before applying rules. If the file is a data source (SSL or SQL),
   parameter syntax and structure rules differ — see `ssl_agent_instructions.md` §4A.
   For data sources:
   <!-- rules: id=no_default_statements_in_datasource,no_flag_builder_directives,datasource_not_script_layout -->
   - Data source files use inline `:PARAMETERS` defaults with `:=` instead of separate `:DEFAULT` statements.
   - SQL data-source builder directives (`:DSN`, `:TABLENAME`, `:NULLASBLANK`, `:INVARIANTDATECOLUMNS`) are preprocessed before compilation and are not normal SSL keywords; do not flag them as unknown keywords.
   - Do not apply normal script `:PARAMETERS`/`:DEFAULT` layout to data-source files.
   <!-- /rules -->

6. **Use these core SSL rules while reviewing** (for server scripts and class files):
   <!-- rules: id=keyword_uppercase,statement_semicolon,no_semicolon_in_comment_text,parameters_first,default_after_parameters,declare_locals_at_start,indent_tabs_preferred,doproc_in_class,try_requires_handler,single_catch_per_try,try_and_finally_bodies_not_empty,no_control_exit_in_finally,begincase_requires_case,exitcase_last_in_branch,visibility_annotation_exact_form,visibility_annotation_form,one_statement_per_line,doproc_for_same_file_procedures,execfunction_for_external_scripts,sql_keyword_case,sql_identifier_case,prefer_exitcase,equals_vs_strict_equals -->
   - Colon-prefixed SSL keywords are uppercase and case-sensitive, for example `:IF` and `:BEGINCASE`.
   - Almost every SSL statement, including comments, must end with a semicolon.
   - Never include a semicolon inside comment text; the first semicolon ends the comment and the remaining text becomes executable code.
   - `:PARAMETERS` must appear before any other statements in a script or procedure body.
   - `:DEFAULT` must immediately follow `:PARAMETERS`.
   - Declare locals at the start of the script or procedure; this is a style preference, because `:DECLARE` is valid anywhere a statement is.
   - Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation.
   - Do not call `DoProc` with a bare procedure name inside class methods; it is a compile-time error. Use `Me:Method()` or `Base:Method()`.
   - `:TRY` requires at least one of `:CATCH` or `:FINALLY`; a bare `:TRY ... :ENDTRY` is invalid.
   - Only one `:CATCH` block is allowed per `:TRY`; there is no multi-catch.
   - The `:TRY` body requires at least one statement, and so does a `:FINALLY` body; a `:CATCH` body may be empty.
   - Do not use `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside `:FINALLY`.
   - `:BEGINCASE` requires at least one `:CASE` block.
   - `:EXITCASE` must be the last statement of its `:CASE`/`:OTHERWISE` branch, directly in the branch body; one nested inside `:IF`, or followed by another statement, is a compile error.
   - Write an access modifier exactly as `/*@private;` or `/*@protected;`: lowercase, with no space between `/*` and `@`.
   - Put an access modifier on its own line immediately before `:PROCEDURE`, with no blank line between them.
   - Use one statement per line.
   - Use `DoProc("ProcName", {args})` for same-file script procedures.
   - Use `ExecFunction("Category.Script", {args})` or `ExecFunction("Category.Script.Proc", {args})` for external script entry points.
   - Inside SQL strings, write SQL keywords and built-in functions in uppercase.
   - Preserve the author's casing for table names, column names and aliases; force-folding is dialect-conditional (safe on Oracle, but breaks case-sensitive SQL Server collations), so lowercase only Oracle-only code.
   - End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.
   - Use `==` for exact string equality; `=` is prefix-style for strings.
   <!-- /rules -->

---

## Check Categories

### `naming` — Hungarian notation and identifier conventions
<!-- rules: id=prefix_matches_type,hungarian_variable_names,procedure_class_pascal_case,constants_upper_snake_case -->
- Make a variable's prefix match the type of the value it holds: `s` string, `n` numeric, `b` boolean, `d` date, `a` array, `o` object, `fn` code block, `v` variant/any.
- Variables use Hungarian-style camelCase: a type prefix, then a camelCase body (`sMyVar`, not `s_my_var` or `SMYVAR`).
- Procedures and classes use PascalCase.
- Constants use UPPER_SNAKE_CASE.
<!-- /rules -->

### `formatting` — Syntax and structural formatting
Flag code that breaks these rules:
<!-- rules: id=statement_semicolon,keyword_uppercase,indent_tabs_preferred,consistent_indentation,member_access_no_spaces,declare_locals_at_start,parameters_first,default_after_parameters -->
- Almost every SSL statement, including comments, must end with a semicolon.
- Colon-prefixed SSL keywords are uppercase and case-sensitive, for example `:IF` and `:BEGINCASE`.
- Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation.
- Keep indentation consistent within a file; do not mix tabs and spaces.
- Prefer no spaces around `:` in member access even though SSL accepts spaced forms.
- Declare locals at the start of the script or procedure; this is a style preference, because `:DECLARE` is valid anywhere a statement is.
- `:PARAMETERS` must appear before any other statements in a script or procedure body.
- `:DEFAULT` must immediately follow `:PARAMETERS`.
<!-- /rules -->

### `error_handling` — Error handling patterns
Flag code that breaks these rules:
<!-- rules: id=prefer_try_over_error_resume,try_requires_handler,single_catch_per_try,no_control_exit_in_finally,no_silent_error_swallowing,wrap_execfunction_for_envelope -->
- Prefer `:TRY`/`:CATCH`/`:FINALLY` over legacy `:ERROR`/`:RESUME`.
- `:TRY` requires at least one of `:CATCH` or `:FINALLY`; a bare `:TRY ... :ENDTRY` is invalid.
- Only one `:CATCH` block is allowed per `:TRY`; there is no multi-catch.
- Do not use `:RETURN`, `:EXITFOR`, `:EXITWHILE`, or `:LOOP` inside `:FINALLY`.
- Log errors with contextual identifiers; avoid swallowing errors silently.
- When the current boundary promises a stable failure envelope, wrap `ExecFunction` in `:TRY`/`:CATCH` unless the deployed function has a documented no-throw contract, and validate the returned envelope even when the call is wrapped.
<!-- /rules -->

### `sql` — SQL construction and parameterization
Flag code that breaks these rules:
<!-- rules: id=prevent_sql_injection,named_sql_param_unsupported,sql_positional_placeholders,udobject_array_in_clause,sql_keyword_case,sql_identifier_case -->
- Prefer parameterized database calls; do not concatenate user or runtime values into SQL when placeholders can bind them.
- `SQLExecute` is the only database API that supports named `?param?` substitution; do not use `?param?` markers with other database functions. Its markers reference in-scope SSL variables by name. Canonical shape: `SQLExecute("UPDATE T SET COL = ?sValue? WHERE ID = ?nId?");`
- `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` use positional `?` markers with a value array in a later argument slot: fourth for `LSearch`, `LSelect` and `LSelectC`, second for `GetDataSet`, and third for `RunSQL` and `LSelect1`. Check `ssl_signature` for the slot and skip unused optionals with adjacent commas. Canonical shape: `aRows := LSelect("SELECT ID FROM T WHERE STATUS = ?",,, {sStatus});`
- Expand only a local array in `IN (?aValues?)`: a UDObject array property expanded directly raises a runtime error, so copy it to a local first.
- Inside SQL strings, write SQL keywords and built-in functions in uppercase.
- Preserve the author's casing for table names, column names and aliases; force-folding is dialect-conditional (safe on Oracle, but breaks case-sensitive SQL Server collations), so lowercase only Oracle-only code.
<!-- /rules -->

Do not flag identifier casing that follows the author's casing (see
`sql-canonical-compact-reference.md`, Identifier Casing).

### `security` — Security-relevant patterns
- SQL injection (see the `sql` checks above)

Flag code that breaks these rules:
<!-- rules: id=no_hardcoded_credentials,validate_dynamic_call_targets,no_silent_error_swallowing -->
- Do not hard-code credentials, passwords or connection strings in SSL code.
- Do not execute code or procedure names derived from untrusted input without validation.
- Log errors with contextual identifiers; avoid swallowing errors silently.
<!-- /rules -->

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
- **Built-in class collisions:** <!-- rule: class_name_not_builtin -->Do not give a `:CLASS` the name of a built-in class such as `Email` or `SSLDataset`.<!-- /rule -->
  Flag any `:CLASS Foo;` declaration where `Foo` matches a built-in class
  name (`AzureStorage`, `Email`, `SQLConnection`, `SSLError`, `SSLDataset`,
  `WebServices`, etc.).
- **Argument-count mismatches:** For calls to documented built-in functions
  with a `parameters` table in the JSON, count required vs. optional
  parameters. Flag calls that pass fewer arguments than required or far
  more than the documented arity.
- **Unknown keywords or operator symbols:** Flag colon-prefixed tokens or
  operator symbols not present in the inventory.

### `all` — Run all of the above

---

## Additional Checks (always applied)

- **Semicolons in comments:** <!-- rule: no_semicolon_in_comment_text -->Never include a semicolon inside comment text; the first semicolon ends the comment and the remaining text becomes executable code.<!-- /rule --> Flag any `/* ... ; ...` where the semicolon is inside the comment body, not at the end.
- **Missing `:EXITCASE`:** <!-- rule: prefer_exitcase -->End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match behavior is intentional.<!-- /rule --> Without `:EXITCASE`, later `:CASE` expressions are still evaluated and additional matching bodies may execute, but `:OTHERWISE` stays skipped once any earlier case body has run.
- **Undeclared variables:** <!-- rule: declare_before_use -->Declare variables before use with `:DECLARE`.<!-- /rule --> Flag variables used before a `:DECLARE` in the same procedure scope. `ssl_diagnose` reports these as `undeclared_variable` warnings under the strict profile, but it validates one document in isolation, so before confirming one check for (a) an `:INCLUDE` — included scripts are spliced in full and may declare the variable, and the command-line validator cannot see them; (b) `:PUBLIC` — publics are shared across the running program and may have been declared by a caller or by an earlier procedure, even one that has already returned. Downgrade such cases to a note, not an error, and say which explains it.
- **Bare procedure calls:** <!-- rule: no_direct_procedure_calls -->Do not call custom script procedures directly as `MyProc()`.<!-- /rule --> Flag direct calls to custom procedure names without `DoProc()` or `ExecFunction()`.
- **`DoProc` in class methods:** <!-- rule: doproc_in_class -->Do not call `DoProc` with a bare procedure name inside class methods; it is a compile-time error. Use `Me:Method()` or `Base:Method()`.<!-- /rule -->
- **Unqualified class field access:** <!-- rule: field_access_via_me -->Inside class methods, access fields through `Me:fieldName` or `Base:fieldName`.<!-- /rule --> Flag any read or write inside a `:CLASS` method of a name that appears in the class's `:DECLARE` list (and is not also a local or `:PARAMETERS` name) without `Me:` (or `Base:` for an inherited field). A bare identifier never refers to the field: it follows normal lookup (local, then caller scopes, then publics), so a read with nothing in reach raises `Variable [name] is undefined!` and a write may land on a caller's or a public variable, leaving the field unchanged.
- **`=` vs `==` for string equality:** <!-- rule: equals_vs_strict_equals -->Use `==` for exact string equality; `=` is prefix-style for strings.<!-- /rule --> Flag `=` used where exact string comparison is likely intended. Note: `!=` negates `==` (strict), not `=` (prefix), so `=` and `!=` are **not** logical opposites for strings.

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

Assign every severity from the **Severity rubric** below — never ad hoc.

If no issues are found in a category, note "No issues found."

---

## Severity rubric

The same item gets the same severity in every review. Take the first
rule that applies:

1. **A validator finding keeps the validator's severity.** `error` is an
   error, `warning` is a warning, and `info` and `hint` rows are
   suggestions. The exceptions are the `undeclared_variable` cases under
   *Not findings* below.
2. **A schema rule with a `severity` sets it.** Confirm it with
   `ssl_style_rule` or the schema itself: `error` is an error, `warning`
   is a warning, and `info` is a suggestion. Do not raise or lower a
   schema severity. A violated `level: authoritative` rule with no
   `severity` is an error, because it is a language rule.
3. **Otherwise, classify by what the defect does:**

| Severity | Test | Examples |
| --- | --- | --- |
| error | It will not compile, it fails at run time on a path the code reaches, or it breaks the stated contract | a `;` inside comment text; an unresolved `DoProc` target, or an `ExecFunction` to a class file; a declared result that is never assigned, or a constant returned in its place; behavior the brief requires that is missing |
| warning | It works on the expected path but misbehaves on some input, error path, or caller | SQL built by concatenating a value; `=` where an exact string match is meant; a commit flag that starts `.T.`; ending a transaction the code did not begin; a `:CATCH` that swallows an error, or clears one it did not read; a server script or class file with no banner, or a nontrivial procedure with no doc block |
| suggestion | The code behaves the same either way; only reading it changes | declaration order within a `:DECLARE` group, or `:DECLARE` placement; banner or doc-block layout and field order; comment layout; line length and wrapping; SQL layout and keyword case; identifier length limits; region and blank-line use |

When an item seems to fit two rows, apply each row's test to it and use
the first test it passes, reading the table top to bottom. State the
test in the finding.

**Not findings.** Report none of these, not even as suggestions:

- A connection argument the brief names. The rule to omit the connection
  argument covers calls to the default database only. A named connection
  does not deviate from it, so it is not a brief-required conflict
  either.
- No `Author` line in the banner of generated code. The banner template
  omits it for generated code.
- An `undeclared_variable` warning for a predefined global the code
  reads on purpose (`ssl_server_script_style.md`, Predefined Globals),
  or for a name an `:INCLUDE` or a caller's `:PUBLIC` explains. List
  these as notes and say which explanation applies.

**Brief-required or style.** A finding is brief-required only when you
can quote the brief section that requires the behavior. It then goes in
the brief-required conflicts section and does not count toward the
verdict. When the brief is silent, the item is an ordinary finding at
its rubric severity. When the rule does not apply to the code at all, as
with a named connection, there is no finding.

**Verdict.** Errors and warnings fail a review. Suggestions never do.

## References

- Compact machine packs: `agent-guides/machine/foundation.md` +
  `agent-guides/machine/categories/` (via `category-index.json` or MCP
  `ssl_context_pack`) — prefer these over the full narrative guides.
- `ssl-style-guide/ssl-style-guide.schema.yaml` and
  `agent-guides/ssl_agent_instructions.md` — the canonical rules and narrative
  reference, when the packs lack detail.
