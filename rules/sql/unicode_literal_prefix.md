---
id: unicode_literal_prefix
title: No N prefix unless Unicode is required
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Use ordinary SQL string literals; add the `N` prefix only when the target
  explicitly requires Unicode literal semantics.
categories: [sql]
enforced_by: [lsp:diag.unicode_literal_prefix]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Use ordinary SQL string literals
    by default. Add the N prefix only when the target explicitly requires
    Unicode literal semantics."). The id is the starlims-lsp info-tier
    diagnostic slug.
---

## Rationale

An `N'...'` literal changes the literal's type, which can change how a
comparison is evaluated against a non-Unicode column.

## Examples

### Good

```ssl
:DECLARE aRows;
aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status = 'Logged'");
```

### Bad

```ssl
:DECLARE aRows;
aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status = N'Logged'");
```
