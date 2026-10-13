---
id: sql_on_indent
title: ON sits 2 spaces under its JOIN
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Indent `ON` 2 spaces under its `JOIN` (in `MERGE`, `ON` stays at column 0).
categories: [sql]
related_elements: [SQLExecute, RunSQL]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.indentation.sub_clauses.on
    form: value
    value: 2
  - path: sql.formatting.statement_patterns.join.on
    form: value
    value: indented 2 under JOIN
verification:
  basis: convention
  note: >-
    Kept from the agent guide's quick reference ("ON indented 2 spaces under
    JOIN (but column 0 in MERGE)"); the ssl-format skill, the schema and the
    compact reference say the same. Matches formatter output at the pinned
    LSP.
---

## Rationale

A join condition belongs to its `JOIN`, so it indents under it like any other
sub-clause. In `MERGE`, `ON` is a clause of the statement itself and starts at
column 0 (see `sql_merge_layout`).

## Examples

### Good

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT o.ordno, t.testcode
    FROM orders o
    INNER JOIN ordtask t
      ON t.ordno = o.ordno
");
```

### Bad

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT o.ordno, t.testcode
    FROM orders o
    INNER JOIN ordtask t ON t.ordno = o.ordno
");
```
