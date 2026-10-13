---
id: datasource_empty_parameters
title: No empty :PARAMETERS line in a data source
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [ssl_data_source, sql_data_source]
rule: >-
  A data source that takes no parameters leaves the `:PARAMETERS` line out;
  an empty `:PARAMETERS;` is an error.
categories: [data-sources]
related_elements: [PARAMETERS]
enforced_by: [lsp:diag.empty_parameters]
schema:
  - path: module_structure.data_source_modules.file_types.ssl_data_source.parameters.empty_parameters_error
    form: value
    value: true
  - path: module_structure.data_source_modules.file_types.sql_data_source.parameters.empty_parameters_error
    form: value
    value: true
verification:
  basis: reference
  note: >-
    Kept from the schema's empty_parameters_error flag, the ssl-new-datasource
    skill and the agent guide's data-source section, which agree.
    starlims-lsp reports an empty :PARAMETERS; as empty_parameters, in any
    file (from v0.25.0).
---

## Rationale

In a data source file, `:PARAMETERS;` with no names after it is an error. A
data source without parameters has nothing to declare, so the line is omitted
rather than left empty.

## Examples

### Good

```ssl kind=ds
:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = 'A'");
```

### Bad

```ssl kind=ds
:PARAMETERS;

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = 'A'");
```
