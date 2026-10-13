---
id: no_default_statements_in_datasource
title: Data sources take defaults inline, not from :DEFAULT
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [ssl_data_source, sql_data_source]
rule: >-
  Data source files use inline `:PARAMETERS` defaults with `:=` instead of
  separate `:DEFAULT` statements.
categories: [data-sources]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [PARAMETERS, DEFAULT, RunDS]
enforced_by: [lsp:diag.no_default_statements_in_datasource]
schema:
  - path: module_structure.data_source_modules.lint_rules
    form: lint
    message: >-
      Data source files use inline := defaults in :PARAMETERS, not separate
      :DEFAULT statements.
  - path: module_structure.data_source_modules.file_types.ssl_data_source.parameters.inline_defaults
    form: value
    value: true
  - path: module_structure.data_source_modules.file_types.sql_data_source.parameters.inline_defaults
    form: value
    value: true
verification:
  basis: reference
  note: >-
    Data source files are rewritten before they run: each inline := default
    becomes a :PARAMETERS plus :DEFAULT pair, so the runtime never sees the
    := form. Kept from the schema lint and the data-sources pack (#48, #82).
issues: ["#48", "#82"]
---

## Rationale

Data source files are preprocessed before they run. The builder rewrites the
inline form `:PARAMETERS p1 := val1, p2 := val2;` into
`:PARAMETERS p1, p2; :DEFAULT p1, val1; :DEFAULT p2, val2;` itself, so a
hand-written `:DEFAULT` does not belong in a data source. The `:=` form is the
required syntax there, so a reviewer must not flag it as incorrect.

## Exceptions

Ordinary server scripts and class files still use `:PARAMETERS` followed by
`:DEFAULT`. This rule applies to data source files only.

## Examples

### Good

```ssl kind=ds
:PARAMETERS sStatus := "A", nMaxRows := 100;

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = ?sStatus?");
```

### Bad

```ssl kind=ds
:PARAMETERS sStatus, nMaxRows;
:DEFAULT sStatus, "A";
:DEFAULT nMaxRows, 100;

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = ?sStatus?");
```
