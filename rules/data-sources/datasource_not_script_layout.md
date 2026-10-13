---
id: datasource_not_script_layout
title: Data sources do not follow the script layout
domain: data-sources
status: active
level: authoritative
severity: warning
applies_to: [ssl_data_source, sql_data_source]
rule: >-
  Do not apply normal script `:PARAMETERS`/`:DEFAULT` layout to data-source
  files.
categories: [data-sources]
machine: { list: avoid }
related_elements: [PARAMETERS, DEFAULT]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the data-sources pack. The same rule appears in the agent
    guide's data-source takeaways, the refactoring guide's data-source layout
    section and the review, refactor and refactor-plan skills.
---

## Rationale

Data source files have their own structure. An SSL data source is an optional
header comment, `:PARAMETERS` with inline defaults, then the SSL body. A SQL
data source is an optional header comment, optional builder directives,
optional `:PARAMETERS` with inline defaults, then the SQL query. The script
layout (a required file banner, `:PARAMETERS` followed by `:DEFAULT`, then
`:INCLUDE`, `:PUBLIC` and `:DECLARE`) does not apply, so refactoring or
reviewing a data source against it gives wrong results.

## Examples

### Good

```ssl kind=ds
:PARAMETERS sStatus := "A", nMaxRows := 100;

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = ?sStatus?");
```

### Bad

```ssl kind=ds
/* ********************************************************************************
Description.. : Samples by status
********************************************************************************;
:PARAMETERS sStatus, nMaxRows;
:DEFAULT sStatus, "A";
:DEFAULT nMaxRows, 100;
:DECLARE aRows;

aRows := SQLExecute("SELECT sample_id FROM sample WHERE status = ?sStatus?");
:RETURN aRows;
```
