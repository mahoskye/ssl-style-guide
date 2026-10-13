---
id: datasource_undeclared_placeholder
title: Every @name placeholder is declared in :PARAMETERS
domain: data-sources
status: active
level: authoritative
severity: warning
applies_to: [sql_data_source]
rule: >-
  Declare every `@name` placeholder of a SQL data-source body in
  `:PARAMETERS`; an undeclared one is not substituted and fails when the query
  executes.
categories: [data-sources]
related_elements: [PARAMETERS]
enforced_by: [lsp:diag.datasource_undeclared_placeholder]
schema:
  - path: module_structure.data_source_modules.lint_rules
    form: lint
    message: >-
      A @name placeholder in a SQL data source body has no matching
      :PARAMETERS declaration — it is not substituted and fails when the query
      executes.
verification:
  basis: reference
  note: >-
    Kept from the schema lint and its body_parameters note, which the agent
    guide repeats (#51).
issues: ["#51"]
---

## Rationale

Only names declared in `:PARAMETERS` are substituted into the SQL body. A
`@name` with no matching declaration, most often a typo of a declared name,
reaches the database unchanged and the query fails there.

## Exceptions

A declared parameter that the body never references is harmless.

## Examples

### Good

```ssl kind=ds
:DSN := DATABASE;
:PARAMETERS sStatus := "A", sUnused := "";

SELECT sampleid, status
FROM sample
WHERE status = @sStatus
```

### Bad

```ssl kind=ds
:DSN := DATABASE;
:PARAMETERS sStatus := "A";

SELECT sampleid, status
FROM sample
WHERE status = @sStat
```
