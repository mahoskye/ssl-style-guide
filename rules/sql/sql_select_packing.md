---
id: sql_select_packing
title: Pack the SELECT list; give complex expressions their own line
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Pack `SELECT` columns onto lines up to about 90 characters: short aliases
  (`col AS alias`) and simple functions (`COUNT(*)`, `UPPER(col)`) can share a
  line, and complex expressions (`CASE`, nested functions, subqueries) break
  to their own line.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.statement_patterns.select.columns
    form: value
    value: pack to ~90 chars; break complex expressions to own line
verification:
  basis: convention
  note: >-
    Merged from the ssl-format skill's three SELECT-list bullets and the
    agent guide's "SELECT list packing" paragraph; the schema and the compact
    reference say the same. The formatter at the pinned LSP repacks a
    one-column-per-line list.
---

## Rationale

A packed list keeps a wide query short enough to see whole, and a complex
expression on its own line is still easy to find and read.

## Examples

### Good

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT ordno, testcode, status AS task_status, UPPER(result) AS result_upper
    FROM ordtask
");
```

### Bad

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT ordno,
           testcode,
           status AS task_status,
           UPPER(result) AS result_upper
    FROM ordtask
");
```
