---
id: sql_case_end_align
title: END aligns with its CASE
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Align `END` with its `CASE`.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.statement_patterns.case.end
    form: value
    value: aligned with CASE
verification:
  basis: observed
  note: >-
    Follows the formatter at the pinned LSP, which returns END to the column
    of CASE; the compact reference (§1, §5), the schema, the ssl-format skill
    and the agent guide say the same (#106).
issues: ["#106"]
---

## Rationale

`END` closes the block that `CASE` opens. Putting it back at the `CASE`
column shows where the expression ends, and any alias after `END` reads as
belonging to the whole expression.

## Examples

### Good

```ssl
:DECLARE aRows;

aRows := SQLExecute("
    SELECT o.ordno,
           CASE
               WHEN o.status = 'L' THEN 'Logged'
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
               ELSE 'Unknown'
               END AS status_desc
    FROM orders o
");
```
