---
id: sql_no_trailing_semicolon
title: Embedded SQL has no trailing semicolon
domain: sql
status: active
level: style_only
severity: warning
applies_to: [embedded_sql]
rule: >-
  Do not put a trailing semicolon inside an embedded SQL string —
  `"SELECT ... ;"` is not the convention; end the SSL statement, not the SQL
  text.
categories: [sql]
machine: { list: avoid, foundation: non_negotiable }
related_elements: [SQLExecute, RunSQL]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the foundation's non-negotiable list. It now also appears in
    the sql pack's avoid list, which had no copy of it.
---

## Rationale

The SQL text in a database call carries no terminator. The semicolon that
ends the line belongs to the SSL statement; a second one inside the string
adds nothing the call needs.

## Examples

### Good

```ssl
:DECLARE aRows;
aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status = 'Logged'");
```

### Bad

```ssl
:DECLARE aRows;
aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status = 'Logged';");
```

## Notes

SQL data-source bodies have their own rule, `datasource_sql_semicolon`.
