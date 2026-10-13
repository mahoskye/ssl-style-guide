---
id: sql_set_operation_spacing
title: Set operators stand between blank lines
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Put a blank line before and after `UNION`, `UNION ALL`, `INTERSECT` and
  `MINUS`.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.statement_patterns.set_operations.vertical_spacing
    form: value
    value: blank line before and after operator
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill; the agent guide's set-operations
    paragraph, the schema and the compact reference say the same. Matches
    formatter output at the pinned LSP.
---

## Rationale

Each side of a set operation is a whole query. Blank lines around the
operator show where one query ends and the next begins.

## Examples

### Good

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT ordno
    FROM ordtask
    WHERE status = 'Logged'

    UNION

    SELECT ordno
    FROM orders
    WHERE status = 'Open'
");
```

### Bad

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT ordno
    FROM ordtask
    WHERE status = 'Logged'
    UNION
    SELECT ordno
    FROM orders
    WHERE status = 'Open'
");
```
