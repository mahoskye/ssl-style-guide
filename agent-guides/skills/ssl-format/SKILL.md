---
name: ssl-format
description: Format SSL code and embedded SQL strings using canonical compact style. Use when asked to format, prettify, or fix indentation in SSL code.
argument-hint: "<file-path> [scope: sql|ssl|all]"
allowed-tools: Read, Write, Edit, Grep, Glob, mcp__ssl-reference__ssl_format, mcp__ssl-reference__ssl_diagnose
---

Format the SSL file at `$ARGUMENTS` (first token is the file path, optional second token is the scope).

## Instructions

1. **If MCP `ssl_format` is available, use it first.** Run `ssl_format` on the file for the SSL-code pass; it handles indentation, spacing, and keyword casing. Then review its diff — the formatter is not fully tuned and can make questionable decisions; correct any output that violates the rules below or clearly hurts readability. Apply the full manual SSL rules below only when the MCP is unavailable. Embedded-SQL canonical-compact formatting (the `sql` scope) is not performed by the formatter — always apply the SQL rules below manually.

2. **Parse arguments:** Extract `<file-path>` as `$0` and optional `[scope]` as `$1` (default: `all`).
   - If no file path is given, ask the user before continuing.
   - Scopes: `sql` = only format embedded SQL strings, `ssl` = only format SSL code, `all` = both.

3. **Read the file** at the given path.

4. **Identify the file type.** If the file is a data source (SSL or SQL), be aware that:
   - `:PARAMETERS` uses inline `:=` defaults — do not split into separate `:DEFAULT` statements
   - SQL data sources may contain builder directives (`:DSN`, `:TABLENAME`, `:NULLASBLANK`, `:INVARIANTDATECOLUMNS`) — format these consistently but do not flag or remove them
   - The SQL query body within data source files still follows canonical compact formatting rules

5. **Format only** — do NOT rename variables, restructure logic, extract procedures, or change behavior. This is a formatting pass, not a refactor.

6. **Apply the rules below** according to scope, then write the file back.

---

## Scope: `ssl` — SSL Code Formatting (manual fallback when `ssl_format` is unavailable)

The manual SSL rules below (source: `agent-guides/ssl_refactoring_guide.md` Part 3) apply only when MCP `ssl_format` cannot be run.

### Indentation
- Prefer tabs; if the file already uses spaces, preserve 4-space indentation
- Indent one level inside blocks: `:IF`, `:ELSE`, `:WHILE`, `:FOR`, `:BEGINCASE`, `:CASE`, `:OTHERWISE`, `:TRY`, `:CATCH`, `:FINALLY`, `:PROCEDURE`
- Do not indent the class body solely because of `:CLASS`; class members stay at the file's top indentation level
- Dedent closing keywords: `:ENDIF`, `:ENDWHILE`, `:NEXT`, `:ENDCASE`, `:ENDTRY`, `:ENDPROC`
- Same-level keywords (dedent then re-indent): `:ELSE`, `:CASE`, `:OTHERWISE`, `:CATCH`, `:FINALLY`
- `:EXITCASE` stays at content level (no indent change)

### Spacing
- Space around `:=`, comparison operators, arithmetic operators
- Space around `.AND.`, `.OR.`, `.NOT.`
- Space after commas, not before
- No space inside parentheses
- No space before `(` in function calls
- No space around `:` in member access (`oObj:Prop`, not `oObj : Prop`)
- Adjacent commas for skipped params, no space (`RunSQL(sSQL,, {aVals})`)

### Line length
- Target ~90 characters
- Break multi-line function calls after commas, indent continuation
- Break multi-line conditions before `.AND.` / `.OR.`, indent continuation

### Semicolons
- Ensure every statement ends with `;` (including comments)
- Do NOT add semicolons to continuation lines within a multi-line expression

### Blank lines
- 1 blank line between procedures
- 1 blank line between logical sections
- Remove excessive consecutive blank lines (3+ becomes 1)

### Region markers
- Leave `/* region Name;` / `/* endregion;` markers as-is; `endregion` takes no name — never append one.

---

## Scope: `sql` — Embedded SQL Formatting (Canonical Compact)

Apply to all SQL strings inside `SQLExecute(`, `RunSQL(`, `LSearch(`, `LSelect(`, `LSelect1(`, `LSelectC(`, `GetDataSet(`, and similar DB function calls.

### General layout
- SQL block indented 4 spaces inside the SSL string literal
- Major clauses at column 0 (relative to the 4-space indent): `SELECT`, `FROM`, `WHERE`, `INNER JOIN`, `LEFT OUTER JOIN`, `RIGHT OUTER JOIN`, `FULL OUTER JOIN`, `CROSS JOIN`, `GROUP BY`, `ORDER BY`, `INSERT INTO`, `VALUES`, `UPDATE`, `DELETE FROM`, `MERGE INTO`, `USING`, `WHEN MATCHED THEN`, `WHEN NOT MATCHED THEN`, `START WITH`, `CONNECT BY`, `PIVOT`, `UNPIVOT`, `FOR UPDATE`, `RETURNING`
- ~90 char line target; break at logical points

### Casing
- SQL keywords and built-in functions: UPPERCASE
- Table names, column names, aliases: lowercase
- Preserve external schema/object casing when required

### Sub-clause indentation (2 spaces under parent)
- `AND`/`OR` indented 2 under `WHERE`, `ON`, or `HAVING`
- `ON` indented 2 under `JOIN`
- `HAVING` indented 2 under `GROUP BY`
- `WHEN`/`ELSE` indented 2 under `CASE`
- `BETWEEN...AND`: the `AND` aligns under `BETWEEN`

### SELECT list
- Pack columns onto lines up to ~90 chars
- Short aliases (`col AS alias`) and simple functions (`COUNT(*)`, `UPPER(col)`) can share a line
- Break complex expressions (CASE, nested functions, subqueries) to their own line
- Continuation lines align to first column (col 7 from SELECT)

### INSERT
- Opening `(` on the `INSERT INTO` line
- Columns indented 4 spaces inside
- Closing `)` on its own line
- Same pattern for `VALUES`

### UPDATE
- `SET` on the same line as `UPDATE`
- Assignments indented 4 spaces below

### MERGE
- `ON` at column 0 (not indented under `USING`)
- Multi-line ON conditions: `AND` indented 4 (aligned under first condition inside parens)
- `UPDATE SET` / `INSERT` / `DELETE WHERE` indented 4 under `WHEN`
- INSERT uses block-style parens

### Set operations
- Blank line before and after `UNION`, `UNION ALL`, `INTERSECT`, `MINUS`

### CASE expressions
- `WHEN`/`ELSE` indented 2 under `CASE`
- Within one CASE block: either all WHEN/THEN branches inline or all broken — don't mix
- `ELSE` may stay inline when its value is short
- When THEN breaks to new line, indent value one level under WHEN

### Optimizer hints
- `/*+ HINT */` stays immediately after the action keyword
- Never remove or reformat hints

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
