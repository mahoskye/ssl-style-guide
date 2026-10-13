---
id: unjustified_collate
title: COLLATE only for a documented contract
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Let ordinary text comparisons use the schema or database collation; force
  `COLLATE` only for a documented comparison contract, and explain why the
  schema collation is insufficient immediately before the query.
categories: [sql]
enforced_by: [lsp:diag.unjustified_collate]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline, which states it word for word. The
    id is the starlims-lsp info-tier diagnostic slug, which reports a
    COLLATE with no comment above the statement.
---

## Rationale

A forced collation overrides what the schema promises for that column. Without
the reason next to it, a reader cannot tell whether it is a contract or an
accident.

## Examples

### Good

```ssl
:DECLARE aRows;
/* Codes differ only by case, so this match must be case-sensitive;
aRows := SQLExecute("
    SELECT ordno
    FROM ordtask
    WHERE code = 'Ab' COLLATE Latin1_General_CS_AS
");
```

### Bad

```ssl
:DECLARE aRows;
aRows := SQLExecute("
    SELECT ordno
    FROM ordtask
    WHERE code = 'Ab' COLLATE Latin1_General_CS_AS
");
```
