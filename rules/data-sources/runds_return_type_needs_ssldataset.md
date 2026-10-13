---
id: runds_return_type_needs_ssldataset
title: RunDS return types convert only an SSLDataset
domain: data-sources
status: active
level: authoritative
severity: warning
applies_to: [ssl_data_source, server_script, class]
rule: >-
  The `RunDS` return-type argument (`"ssldataset"`, `"xml"`, and so on)
  converts only an `SSLDataset` result; an SSL data source that callers request
  in another return type returns an `SSLDataset`, for example from
  `GetSSLDataset`.
categories: [data-sources]
related_elements: [RunDS, GetSSLDataset, SSLDataset, SQLExecute]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the agent guide's Calling Data Sources section and the
    ssl-new-datasource skill, which agree (#82).
issues: ["#82"]
---

## Rationale

`RunDS` converts the data source's result to the requested return type only
when that result is an `SSLDataset`. An SSL data source whose body returns an
array, for example from `SQLExecute`, returns that array whatever return type
the caller asks for.

## Examples

### Good

```ssl kind=ds
/* Callers use RunDS with the ssldataset return type;
:PARAMETERS sStatus := "A";

:RETURN GetSSLDataset("SELECT sample_id FROM sample WHERE status = @sStatus",, {"@sStatus"}, {sStatus});
```

### Bad

```ssl kind=ds
/* Callers use RunDS with the ssldataset return type;
:PARAMETERS sStatus := "A";

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = ?sStatus?");
```
