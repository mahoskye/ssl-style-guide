---
id: sql_multiline_strings
title: Non-trivial queries are multi-line strings, one major clause per line
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql]
rule: >-
  Use multiline SQL strings for non-trivial queries and put major clauses on
  separate lines.
categories: [sql]
machine: { list: must_follow }
related_elements: [SQLExecute, RunSQL, LSearch, LSelect1, GetDataSet]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the sql pack. The formatter breaks a single-line query into
    clauses only when it overflows the line, so a reviewer judges the rest.
---

## Rationale

A query laid out one clause per line can be read, compared and reviewed
clause by clause. The formatter keeps a multi-line string in the canonical
compact layout, but leaves a single-line string that fits its line exactly as
written.

## Exceptions

A short, simple lookup (one table, one condition) may stay on one line.

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
    WHERE t.status = ?sStatus?
");
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("SELECT o.ordno FROM orders o INNER JOIN ordtask t ON t.ordno = o.ordno");
```
