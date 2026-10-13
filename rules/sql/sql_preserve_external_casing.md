---
id: sql_preserve_external_casing
title: Keep the casing an external object requires
domain: sql
status: active
level: style_only
severity: warning
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Preserve external schema or object casing when the schema or object requires
  it.
categories: [sql]
related_elements: [SQLExecute, RunSQL]
enforced_by: [reviewer]
schema:
  - path: sql.formatting.preserve_external_casing
    form: value
    value: true
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill ("Preserve external schema/object casing
    when required") and the schema's preserve_external_casing.
---

## Rationale

Some objects are created with a fixed casing: quoted identifiers, objects
owned by another system, or names on a case-sensitive collation. Their casing
is part of the name, so it survives even an Oracle-only lowercase pass.

## Examples

### Good

```ssl
:DECLARE aRows;
aRows := SQLExecute('SELECT "OrderNo", "Status" FROM "ExtOrders"');
```

### Bad

```text
Author wrote:  SELECT "OrderNo", "Status" FROM "ExtOrders"
Rewritten as:  SELECT "orderno", "status" FROM "extorders"
The quoted names no longer match the objects.
```
