---
id: sql_case_when_else_indent
title: WHEN and ELSE indent under CASE
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Indent `WHEN`/`ELSE` 4 spaces under `CASE`.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.indentation.sub_clauses.case_when_else
    form: value
    value: 4
  - path: sql.formatting.statement_patterns.case.when_else
    form: value
    value: indented 4 under CASE
verification:
  basis: observed
  note: >-
    Follows the formatter at the pinned LSP, which puts WHEN/ELSE 4 spaces
    under CASE in the SELECT list; the compact reference (§1, §5), the
    schema, the ssl-format skill and the agent guide say the same (#106).
issues: ["#106"]
---

## Rationale

`WHEN` and `ELSE` belong to their `CASE`, so they indent one 4-space step
under it, and the branches line up as a table of conditions and results.

## Examples

### Good

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT o.ordno,
           CASE
               WHEN o.status = 'L' THEN 'Logged'
               WHEN o.status = 'C' THEN 'Complete'
               ELSE 'Unknown'
           END AS status_desc
    FROM orders o
");
```

### Bad

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT o.ordno,
           CASE
             WHEN o.status = 'L' THEN 'Logged'
             WHEN o.status = 'C' THEN 'Complete'
             ELSE 'Unknown'
           END AS status_desc
    FROM orders o
");
```
