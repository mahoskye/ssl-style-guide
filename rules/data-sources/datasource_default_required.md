---
id: datasource_default_required
title: Every data-source parameter has an inline default
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [ssl_data_source, sql_data_source]
rule: >-
  Give every data-source parameter an inline `:=` default; a parameter without
  one makes the data source fail when it runs.
categories: [data-sources]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [PARAMETERS, RunDS]
enforced_by: [reviewer]
schema:
  - path: module_structure.data_source_modules.lint_rules
    form: lint
    message: >-
      Every parameter in a data source :PARAMETERS declaration must have an
      inline := default value. A parameter without one makes the data source
      fail when it runs: No default value for one or more parameters.
  - path: module_structure.data_source_modules.file_types.ssl_data_source.parameters.default_required
    form: value
    value: true
  - path: module_structure.data_source_modules.file_types.sql_data_source.parameters.default_required
    form: value
    value: true
verification:
  basis: observed
  note: >-
    A data source with a parameter that has no inline default fails when it
    runs, whatever the caller passes, with "No default value for one or more
    parameters." (#82, which reversed the optional-default reading of #48). The
    starlims-lsp catalog still records this diagnostic as removed, following
    #48, so reviewers enforce it until the two agree.
issues: ["#48", "#82"]
---

## Rationale

The data source builder needs a default for each parameter it rewrites. When
one is missing, the data source fails at run time with
`No default value for one or more parameters.`, even when the caller passes a
value for that parameter.

## Examples

### Good

```ssl kind=ds
:PARAMETERS sStatus := "A", nMaxRows := 100;

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = ?sStatus?");
```

### Bad

```ssl kind=ds
:PARAMETERS sStatus := "A", nMaxRows;

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = ?sStatus?");
```
