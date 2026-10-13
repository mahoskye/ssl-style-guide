---
id: sqlexecute_no_values_array
title: SQLExecute takes no values array
domain: sql
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  A values array on `SQLExecute`: `SQLExecute(sSql, {args})` passes the array
  as a **connection name** — SQLExecute binds via `?name?` markers only (see
  the database rules above).
categories: [database]
machine: { foundation: does_not_have }
related_elements: [SQLExecute]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the foundation's "SSL Does Not Have" list, which states it word
    for word. It was also a clause of named_sql_param_unsupported ("it has no
    values-array parameter (the second parameter is a connection name)"),
    which now leaves it to this record. starlims-lsp v0.24.0 does not report
    an array in the second slot.
---

## Rationale

`SQLExecute` takes its values from the `?name?` markers in the SQL text. Its
second parameter is a connection name, so an array passed there is not bound
to anything.

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("SELECT ordno FROM orders WHERE status = ?sStatus?");
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("SELECT ordno FROM orders WHERE status = ?", {sStatus});
```
