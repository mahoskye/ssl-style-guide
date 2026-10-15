---
id: getssldataset_at_name_markers
title: GetSSLDataset binds @name markers from name and value arrays
domain: sql
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `GetSSLDataset` uses `@name` markers with parallel name and value arrays.
categories: [database]
machine: { list: must_follow }
related_elements: [GetSSLDataset]
enforced_by: [reviewer]
schema:
  - path: sql.parameters.at_name_supported_by
    form: value
    value: [GetSSLDataset]
verification:
  basis: reference
  note: >-
    Kept from the database pack. The agent guide's quick start #8 and gotcha
    #20 and the schema's sql.parameters.at_name_supported_by say the same.
    Argument slots checked against the element reference signature.
---

## Rationale

`GetSSLDataset(sSql, [sDsn], [aParamNames], [aParamValues], ...)` matches each
`@name` in the SQL text to the same name in the names array and binds the
value at the same index of the values array. It does not read `?` or `?name?`
markers.

## Examples

### Good

```ssl
:DECLARE sSql, sStatus, oDs;

sStatus := "Logged";
sSql := "SELECT ordno FROM ordtask WHERE status = @status";
oDs := GetSSLDataset(sSql,, {"status"}, {sStatus});
```

### Bad

```ssl
:DECLARE sSql, sStatus, oDs;
sStatus := "Logged";
sSql := "SELECT ordno FROM ordtask WHERE status = ?";
oDs := GetSSLDataset(sSql,,, {sStatus});
```

## Notes

SQL data-source files also use `@name` placeholders, because the builder
rewrites them into a `GetSSLDataset` call (see
`datasource_sql_at_name_placeholders`).
