---
id: sql_having_indent
title: HAVING sits 2 spaces under GROUP BY
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Indent `HAVING` 2 spaces under `GROUP BY`.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.indentation.sub_clauses.having
    form: value
    value: 2
  - path: sql.formatting.statement_patterns.group_by.having
    form: value
    value: indented 2 under GROUP BY
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill, the agent guide's quick reference, the
    schema and the compact reference. Matches formatter output at the pinned
    LSP.
---

## Rationale

This style treats `HAVING` as a sub-clause of `GROUP BY`: it filters the
groups that clause made. Styles that put `HAVING` at column 0 differ on
purpose.

## Examples

### Good

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT ordno, COUNT(*) AS ntests
    FROM ordtask
    GROUP BY ordno
      HAVING COUNT(*) > 1
");
```

### Bad

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT ordno, COUNT(*) AS ntests
    FROM ordtask
    GROUP BY ordno
    HAVING COUNT(*) > 1
");
```
