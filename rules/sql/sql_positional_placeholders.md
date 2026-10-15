---
id: sql_positional_placeholders
title: Other database functions bind positional ? markers from a values array
domain: sql
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `RunSQL`, `LSearch`, `LSelect`, `LSelect1`, `LSelectC`, and `GetDataSet` use
  positional `?` markers with a value array in a later argument slot: fourth
  for `LSearch`, `LSelect` and `LSelectC`, second for `GetDataSet`, and third
  for `RunSQL` and `LSelect1`. Check `ssl_signature` for the slot and skip
  unused optionals with adjacent commas. Canonical shape:
  `aRows := LSelect("SELECT ID FROM T WHERE STATUS = ?",,, {sStatus});`
categories: [database]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [RunSQL, LSearch, LSelect, LSelect1, LSelectC, GetDataSet]
enforced_by: [reviewer]
schema:
  - path: sql.parameters.positional_supported_by
    form: value
    value: [RunSQL, LSearch, LSelect, LSelect1, LSelectC, GetDataSet]
  - path: sql.parameters.values_array_position
    form: value
    value:
      third: [RunSQL, LSelect1]
      fourth: [LSearch, LSelect, LSelectC]
      second: [GetDataSet]
verification:
  basis: reference
  note: >-
    Merged from the database pack ("...; LSearch, LSelect and LSelectC take
    the array fourth and GetDataSet second.") and the foundation's positional
    bullet (later slot, ssl_signature, adjacent commas, canonical shape). The
    third-slot functions come from sql.parameters.values_array_position.
    Matches the agent guide §4 and the element reference signatures (#82).
issues: ["#82"]
---

## Rationale

Each function takes its values array at a fixed argument position, after
optional arguments such as a connection name or a default value. An array
passed in an earlier slot is read as that earlier argument: for `LSelect` the
second slot is an unimplemented field list, and any value there raises an
error. Skipped optionals are written as adjacent commas, not `NIL`.

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;

sStatus := "Logged";
aRows := LSelect("SELECT ordno FROM ordtask WHERE status = ?",,, {sStatus});
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := LSelect("SELECT ordno FROM ordtask WHERE status = ?", {sStatus});
```
