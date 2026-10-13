---
id: sql_no_mixed_placeholder_styles
title: One placeholder style per call
domain: sql
status: active
level: advisory
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Do not mix named and positional placeholder mental models in the same call.
categories: [sql]
machine: { list: avoid }
related_elements: [SQLExecute, RunSQL]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the sql pack's avoid list.
---

## Rationale

Each database function reads one placeholder shape: `?name?` for
`SQLExecute`, positional `?` with a values array for the others, and `@name`
for `GetSSLDataset`. A call that mixes shapes leaves some markers unbound.

## Examples

### Good

```ssl
:DECLARE sOrdNo, sStatus;
sOrdNo := "A1001";
sStatus := "Done";
RunSQL("UPDATE ordtask SET status = ? WHERE ordno = ?",, {sStatus, sOrdNo});
```

### Bad

```ssl
:DECLARE sOrdNo, sStatus;
sOrdNo := "A1001";
sStatus := "Done";
RunSQL("UPDATE ordtask SET status = ?sStatus? WHERE ordno = ?",, {sOrdNo});
```
