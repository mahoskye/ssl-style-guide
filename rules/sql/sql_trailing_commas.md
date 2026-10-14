---
id: sql_trailing_commas
title: SQL list commas trail the line
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Put commas at the end of the line (trailing comma style), not at the start
  of the next line.
categories: [sql]
related_elements: [SQLExecute, RunSQL]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.comma_style
    form: value
    value: trailing
verification:
  basis: convention
  note: >-
    Kept from the agent guide's quick reference ("Trailing commas"), the
    schema's comma_style and the compact reference. Matches formatter output
    at the pinned LSP, which also repacks the list.
---

## Rationale

Trailing commas keep each continuation line starting with a column, so a
packed `SELECT` list reads left to right like prose.

## Examples

### Good

```ssl
:DECLARE aRows;

aRows := SQLExecute("
    SELECT ordno, testcode, status
    FROM ordtask
");
```

### Bad

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT ordno
         , testcode
         , status
    FROM ordtask
");
```

## Notes

The schema's `comma_style` is about SQL lists only. It is unrelated to
`arrays.allow_trailing_comma`, which is about SSL array literals.
