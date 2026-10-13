---
id: named_sql_param_unsupported
title: Only SQLExecute substitutes ?name? markers
domain: sql
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `SQLExecute` is the only database API that supports named `?param?`
  substitution; do not use `?param?` markers with other database functions.
  Its markers reference in-scope SSL variables by name and it has no
  values-array parameter (the second parameter is a connection name).
  Canonical shape: `SQLExecute("UPDATE T SET COL = ?sValue? WHERE ID = ?nId?");`
categories: [database]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [SQLExecute, RunSQL, LSearch, LSelect, LSelect1, LSelectC, GetDataSet]
enforced_by: [lsp:diag.named_sql_param_unsupported]
schema:
  - path: sql.parameters.named_supported_by
    form: value
    value: [SQLExecute]
verification:
  basis: reference
  note: >-
    Kept from the foundation's SQLExecute bullet, which is the fullest copy,
    with the database pack's avoid item ("Do not use ?param? named
    substitution with non-SQLExecute database functions.") merged in. The
    pack's must-follow item, the agent guide's quick start #8 and gotcha #20,
    and the schema's sql.parameters.named_supported_by say the same.
issues: ["#82"]
---

## Rationale

`SQLExecute` reads each `?name?` marker as an SSL expression, usually a
variable in scope, and substitutes its value. The other database functions
treat `?` as a positional marker and bind values from an array, so a
`?name?` marker reaches the database as text and the query fails. Because
`SQLExecute` takes its values from the markers, its second argument is a
connection name: an array passed there is not a values array.

## Exceptions

`GetSSLDataset` uses `@name` markers with name and value arrays (see
`getssldataset_at_name_markers`).

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("SELECT ordno FROM ordtask WHERE status = ?sStatus?");
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := LSelect1("SELECT ordno FROM ordtask WHERE status = ?sStatus?");
```

## Notes

The foundation's "SSL Does Not Have" list also states the values-array half
("A values array on `SQLExecute`"). That list is not generated yet.
