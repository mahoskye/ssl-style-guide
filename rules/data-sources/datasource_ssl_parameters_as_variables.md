---
id: datasource_ssl_parameters_as_variables
title: SSL data sources use parameters as variables
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [ssl_data_source]
rule: >-
  In an SSL data source, use parameters as ordinary variables by their bare
  names; `@name` placeholders are not part of this file type.
categories: [data-sources]
related_elements: [PARAMETERS, SQLExecute, GetSSLDataset]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the schema's ssl_data_source comments note. The
    ssl-new-datasource skill's SSL template marks parameters as ?name? inside
    SQLExecute, as an SSL script does (#82).
issues: ["#82"]
---

## Rationale

The body of an SSL data source is an SSL script. Its parameters are variables,
so embedded SQL references them the way any script does, for example as
`?name?` markers in `SQLExecute`. A `@name` written into a `SQLExecute`
string is not substituted.

## Exceptions

`GetSSLDataset` uses `@name` markers with parallel name and value arrays as
part of its own call syntax, for example
`GetSSLDataset("SELECT * FROM sample WHERE status = @sStatus",, {"@sStatus"}, {sStatus})`.
That is the function's syntax, not a data-source placeholder.

## Examples

### Good

```ssl kind=ds
:PARAMETERS sStatus := "A";

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = ?sStatus?");
```

### Bad

```ssl kind=ds
:PARAMETERS sStatus := "A";

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = @sStatus");
```
