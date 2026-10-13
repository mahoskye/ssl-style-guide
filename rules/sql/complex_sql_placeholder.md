---
id: complex_sql_placeholder
title: Pre-compute values instead of computing them inside ?name? markers
domain: sql
status: active
level: advisory
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Pre-compute complex values before interpolating them into `SQLExecute`
  placeholders.
categories: [sql]
machine: { list: must_follow }
related_elements: [SQLExecute]
enforced_by: [lsp:diag.complex_sql_placeholder]
verification:
  basis: reference
  note: >-
    Kept from the sql pack. The agent guide's SQL guidance (#2, "Pre-compute
    complex expressions") and gotcha #21 say the same.
---

## Rationale

`SQLExecute` evaluates the expression inside each `?...?` marker every time
the statement runs. A plain variable is cheaper, easier to read, and holds a
value you can inspect before the query runs.

## Examples

### Good

```ssl
:DECLARE sPrefix, sSuffix, sOrdNo, aRows;
sPrefix := "A";
sSuffix := "1001";
sOrdNo := sPrefix + sSuffix;
aRows := SQLExecute("SELECT testcode FROM ordtask WHERE ordno = ?sOrdNo?");
```

### Bad

```ssl
:DECLARE sPrefix, sSuffix, aRows;
sPrefix := "A";
sSuffix := "1001";
aRows := SQLExecute("SELECT testcode FROM ordtask WHERE ordno = ?sPrefix + sSuffix?");
```
