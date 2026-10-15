---
id: sql_and_or_indent
title: AND/OR continue 2 spaces in, aligned with ON and HAVING
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Start each `AND`/`OR` condition on its own line, indented 2 spaces under
  `WHERE`; in a join condition it aligns with `ON`, and in a `HAVING`
  condition with `HAVING`.
categories: [sql]
related_elements: [SQLExecute, RunSQL]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.indentation.sub_clauses.and_or
    form: value
    value: 2
  - path: sql.formatting.statement_patterns.where.and_or
    form: value
    value: indented 2 under WHERE
  - path: sql.formatting.statement_patterns.join.on_and
    form: value
    value: same indent as ON (2 under JOIN)
verification:
  basis: observed
  note: >-
    The ssl-format skill and the agent guide say "AND/OR indented 2 under
    WHERE, ON, or HAVING". The schema's join.on_and and the compact
    reference's indentation diagram say AND in a join aligns with ON, and the
    formatter at the pinned LSP aligns AND with ON and with HAVING. The rule
    states the formatter's layout; the wording follows the design example.
---

## Rationale

Major clauses sit at column 0 of the SQL block, so a 2-space step sets each
condition off from the next clause without spending a full indent level.
`ON` and `HAVING` already sit 2 in, so their conditions line up with them.

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;

sStatus := "Logged";
aRows := SQLExecute("
    SELECT o.ordno, t.testcode
    FROM orders o
    INNER JOIN ordtask t
      ON t.ordno = o.ordno
      AND t.testcode = 'PH'
    WHERE o.status = ?sStatus?
      AND t.status = 'Done'
");
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("
    SELECT o.ordno, t.testcode
    FROM orders o
    INNER JOIN ordtask t
      ON t.ordno = o.ordno
        AND t.testcode = 'PH'
    WHERE o.status = ?sStatus?
    AND t.status = 'Done'
");
```
