---
id: sql_select_continuation
title: SELECT continuation lines align to the first column
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Align `SELECT` continuation lines to the first column (column 7).
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.indentation.select_continuation_align
    form: value
    value: first_column
  - path: sql.formatting.indentation.select_continuation_column
    form: value
    value: 7
  - path: sql.formatting.statement_patterns.select.continuation
    form: value
    value: align to first column (col 7)
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill ("Continuation lines align to first
    column (col 7 from SELECT)"), the agent guide's quick reference, the
    schema and the compact reference. Matches formatter output at the pinned
    LSP.
---

## Rationale

`SELECT` plus a space is 7 characters, so column 7 is where the first column
name starts. Continuation lines that start there read as one list.

## Examples

### Good

```ssl
:DECLARE aRows;

aRows := SQLExecute("
    SELECT o.ordno, o.testcode, o.status AS task_status, o.logdate, o.analyst,
           UPPER(o.result) AS result_upper
    FROM ordtask o
");
```

### Bad

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT o.ordno, o.testcode, o.status AS task_status, o.logdate, o.analyst,
      UPPER(o.result) AS result_upper
    FROM ordtask o
");
```
