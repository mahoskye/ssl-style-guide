---
name: ssl-format
description: Format SSL code and embedded SQL strings using canonical compact style. Use when asked to format, prettify, or fix indentation in SSL code.
argument-hint: "<file-path> [scope: sql|ssl|all]"
allowed-tools: Read, Write, Edit, Grep, Glob, mcp__ssl-reference__ssl_format, mcp__ssl-reference__ssl_diagnose
---

Format the SSL file at `$ARGUMENTS` (first token is the file path, optional second token is the scope).

## Instructions

1. **If MCP `ssl_format` is available, use it first.** Run `ssl_format` on the file for the SSL-code pass; it handles indentation, spacing, and keyword casing. Then review its diff — the formatter is not fully tuned and can make questionable decisions; correct any output that violates the rules below or clearly hurts readability. If the MCP is unavailable, run the same formatter from the command line (`starlims-lsp --format <file>`, binary in `ssl-mcp-server/bin/lsp/`); apply the full manual SSL rules below only when neither can run. The formatter also lays out embedded SQL: it re-indents a multi-line SQL string and breaks an over-long one into canonical-compact clauses, uppercasing SQL keywords. It leaves a SQL string that fits on one line exactly as written, keyword case included. So the `sql` scope is never skipped: check every SQL string against the SQL rules below, correct what the formatter produced, and finish by hand what it left.

2. **Parse arguments:** Extract `<file-path>` as `$0` and optional `[scope]` as `$1` (default: `all`).
   - If no file path is given, ask the user before continuing.
   - Scopes: `sql` = only format embedded SQL strings, `ssl` = only format SSL code, `all` = both.

3. **Read the file** at the given path.

4. **Identify the file type.** If the file is a data source (SSL or SQL), these rules apply:
   <!-- rules: id=no_default_statements_in_datasource,no_flag_builder_directives,datasource_sql_body_compact_layout -->
   - Data source files use inline `:PARAMETERS` defaults with `:=` instead of separate `:DEFAULT` statements.
   - SQL data-source builder directives are preprocessed before compilation and are not normal SSL keywords.
   - Lay out the query body of a SQL data source in the canonical compact SQL style, the same as SQL embedded in SSL strings.
   <!-- /rules -->

   SQL data sources may contain the builder directives `:DSN`, `:TABLENAME`,
   `:NULLASBLANK` and `:INVARIANTDATECOLUMNS`. Format them consistently, but do
   not flag or remove them.

5. **Format only** — do NOT rename variables, restructure logic, extract procedures, or change behavior. This is a formatting pass, not a refactor.

6. **Apply the rules below** according to scope, then write the file back.

---

## Scope: `ssl` — SSL Code Formatting (manual fallback when `ssl_format` is unavailable)

The manual SSL rules below (source: `agent-guides/ssl_refactoring_guide.md` Part 3) apply only when MCP `ssl_format` cannot be run.

### Indentation
<!-- rules: id=indent_tabs_preferred,indent_block_bodies,class_members_top_level,dedent_closing_keywords,same_level_block_keywords,exitcase_statement_level -->
- Prefer tabs for indentation; if the file already uses spaces, preserve 4-space indentation.
- Indent the body of a block one level: `:IF`, `:WHILE`, `:FOR`, `:BEGINCASE`, `:TRY`, `:PROCEDURE`, `:REGION` and `:BEGININLINECODE` open an indented body, and each nested block adds one more level.
- Do not indent the class body because of `:CLASS`; class members stay at the file's top indentation level.
- Dedent a closing keyword to the level of the keyword that opened its block: `:ENDIF`, `:ENDWHILE`, `:NEXT`, `:ENDCASE`, `:ENDTRY`, `:ENDPROC`, `:ENDREGION` and `:ENDINLINECODE`.
- Put `:ELSE`, `:CASE`, `:OTHERWISE`, `:CATCH` and `:FINALLY` at the level of the keyword that opened their block, then indent the body that follows them one level.
- Indent `:EXITCASE` at the level of the other statements in its branch; it does not change the indentation.
<!-- /rules -->

### Spacing
<!-- rules: id=operator_spacing,comma_spacing,no_space_inside_parens,no_space_before_call_paren,member_access_no_spaces,skip_commas_adjacent -->
- Use spaces around assignment, arithmetic, comparison, and logical operators.
- Put a space after each comma and none before it.
- Do not put spaces just inside parentheses: `DoProc("Name", {args})`, not `DoProc( "Name", {args} )`.
- Do not put a space between a function name and its `(`: `Len(sValue)`, not `Len (sValue)`.
- Prefer no spaces around `:` in member access even though SSL accepts spaced forms.
- Use adjacent commas with no spaces for skipped optional parameters.
<!-- /rules -->

### Line length
<!-- rules: id=ssl_max_line_length,continuation_line_breaks -->
- Keep SSL lines to about 90 characters, breaking longer ones at logical points.
- Break a multi-line function call after a comma and a multi-line condition before `.AND.` or `.OR.`, and indent each continuation line one level.
<!-- /rules -->

### Semicolons
<!-- rules: id=statement_semicolon,no_semicolon_on_continuation_lines -->
- Almost every SSL statement, including comments, must end with a semicolon.
- Do not end a continuation line of a multi-line statement with a semicolon; only the line that completes the statement takes one.
<!-- /rules -->

### Blank lines
<!-- rules: id=blank_line_between_procedures,visibility_annotation_form,visibility_annotation_exact_form,blank_line_between_sections,no_excess_blank_lines -->
- Put one blank line between procedures.
- Put an access modifier on its own line immediately before `:PROCEDURE`, with no blank line between them.
- Write an access modifier exactly as `/*@private;` or `/*@protected;`: lowercase, with no space between `/*` and `@`.
- Put one blank line between logical sections and between regions.
- Do not leave three or more consecutive blank lines; reduce such a run to one.
<!-- /rules -->

An access modifier (`/*@private;` or `/*@protected;`) is not a comment, so the
comment layout rules do not apply to it, and a blank line after it breaks it.

### Region markers
Leave `/* region Name;` / `/* endregion;` markers as they are.
<!-- rules: id=endregion_takes_no_name -->
- Close a comment region with `/* endregion;` alone; `endregion` takes no name, so never append one.
<!-- /rules -->

---

## Scope: `sql` — Embedded SQL Formatting (Canonical Compact)

Apply to all SQL strings inside `SQLExecute(`, `RunSQL(`, `LSearch(`, `LSelect(`, `LSelect1(`, `LSelectC(`, `GetDataSet(`, and similar DB function calls.

### General layout
<!-- rules: id=sql_ssl_embedding_indent,sql_major_clause_column,sql_max_line_length -->
- Indent the whole SQL block 4 spaces inside the SSL string literal.
- Start each major clause at column 0 relative to the 4-space indent: `SELECT`, `FROM`, `WHERE`, `INNER JOIN`, `LEFT OUTER JOIN`, `RIGHT OUTER JOIN`, `FULL OUTER JOIN`, `CROSS JOIN`, `GROUP BY`, `ORDER BY`, `UNION`, `UNION ALL`, `INTERSECT`, `MINUS`, `INSERT INTO`, `VALUES`, `UPDATE`, `DELETE FROM`, `MERGE INTO`, `USING`, `WHEN MATCHED THEN`, `WHEN NOT MATCHED THEN`, `START WITH`, `CONNECT BY`, `PIVOT`, `UNPIVOT`, `FOR UPDATE`, `RETURNING`.
- Keep SQL lines to about 90 characters, breaking at logical points.
<!-- /rules -->

### Casing
<!-- rules: id=sql_keyword_case,sql_identifier_case,sql_preserve_external_casing -->
- Inside SQL strings, write SQL keywords and built-in functions in uppercase.
- Preserve the author's casing for table names, column names and aliases; force-folding is dialect-conditional (safe on Oracle, but breaks case-sensitive SQL Server collations), so lowercase only Oracle-only code.
- Preserve external schema or object casing when the schema or object requires it.
<!-- /rules -->

### Sub-clause indentation (2 spaces under parent)
<!-- rules: id=sql_and_or_indent,sql_on_indent,sql_having_indent,sql_between_and_align,sql_case_when_else_indent -->
- Start each `AND`/`OR` condition on its own line, indented 2 spaces under `WHERE`; in a join condition it aligns with `ON`, and in a `HAVING` condition with `HAVING`.
- Indent `ON` 2 spaces under its `JOIN` (in `MERGE`, `ON` stays at column 0).
- Indent `HAVING` 2 spaces under `GROUP BY`.
- When a `BETWEEN ... AND` range breaks across lines, align its `AND` under `BETWEEN`.
- Indent `WHEN`/`ELSE` 2 spaces under `CASE`.
<!-- /rules -->

### SELECT list
<!-- rules: id=sql_select_packing,sql_select_continuation -->
- Pack `SELECT` columns onto lines up to about 90 characters: short aliases (`col AS alias`) and simple functions (`COUNT(*)`, `UPPER(col)`) can share a line, and complex expressions (`CASE`, nested functions, subqueries) break to their own line.
- Align `SELECT` continuation lines to the first column (column 7).
<!-- /rules -->

### INSERT
<!-- rules: id=sql_insert_layout -->
- In `INSERT`, put the opening `(` on the `INSERT INTO` line, indent the columns 4 spaces, and put the closing `)` on its own line; lay out `VALUES` the same way.
<!-- /rules -->

### UPDATE
<!-- rules: id=sql_update_layout -->
- In `UPDATE`, keep `SET` on the `UPDATE` line and indent the assignments 4 spaces below it.
<!-- /rules -->

### MERGE
For formatting existing code only. Agents do not write `MERGE` (see the basic-SQL rule in the agent boundaries).

<!-- rules: id=sql_merge_layout -->
- When formatting an existing `MERGE`, put `ON` at column 0 (not indented under `USING`), indent the `AND` of a multi-line `ON` condition 4 spaces (under the first condition inside the parentheses), indent `UPDATE SET`, `INSERT` and `DELETE WHERE` 4 spaces under their `WHEN`, and give the `INSERT` block-style parentheses.
<!-- /rules -->

### Set operations
<!-- rules: id=sql_set_operation_spacing -->
- Put a blank line before and after `UNION`, `UNION ALL`, `INTERSECT` and `MINUS`.
<!-- /rules -->

### CASE expressions
<!-- rules: id=sql_case_when_else_indent,sql_case_branch_consistency,sql_case_then_break -->
- Indent `WHEN`/`ELSE` 2 spaces under `CASE`.
- Within one `CASE` block, keep all `WHEN`/`THEN` branches inline or break them all; do not mix. `ELSE` may stay inline when its value is short.
- When a `THEN` value breaks to a new line, indent it one level under its `WHEN`.
<!-- /rules -->

### Optimizer hints
<!-- rules: id=sql_optimizer_hints -->
- Keep an optimizer hint (`/*+ HINT */`) immediately after its action keyword; never remove or reformat a hint without understanding its purpose.
<!-- /rules -->

---

## Scope: `all` — Apply Both

Apply `ssl` formatting first, then `sql` formatting to embedded SQL strings.

---

## Process

1. Read the entire file
2. Identify all SQL string literals (inside DB function calls)
3. Apply formatting rules per scope
4. Write the formatted file using Edit (prefer minimal diffs) or Write (if changes are extensive)
5. Verify: if MCP `ssl_diagnose` is available, run it on the written file and confirm zero new errors (formatting must never introduce diagnostics). Without MCP, re-read the file and manually confirm block pairing and terminal semicolons.
6. Report what was changed

## Output

After formatting, provide a concise summary:
```
Formatting complete (scope: <scope>):
- [list of changes made, e.g., "Fixed SQL indentation in 3 queries", "Normalized spacing around operators"]
```

If the file is already correctly formatted, report "No formatting changes needed."
