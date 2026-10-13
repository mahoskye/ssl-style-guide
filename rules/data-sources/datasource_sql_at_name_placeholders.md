---
id: datasource_sql_at_name_placeholders
title: SQL data-source bodies use @name placeholders
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [sql_data_source]
rule: >-
  Reference SQL data-source parameters in the SQL body as `@name`
  placeholders, not `?name?` markers.
categories: [data-sources]
machine: { list: must_follow }
related_elements: [PARAMETERS, SQLExecute]
enforced_by: [lsp:diag.datasource_sql_question_placeholder]
schema:
  - path: module_structure.data_source_modules.file_types.sql_data_source.body_parameters.syntax
    form: value
    value: "@name"
verification:
  basis: reference
  note: >-
    Kept from the data-sources pack, which stated it twice (as a must-follow
    and as an avoid item); merged here. Matches the schema's body_parameters
    entry and the agent guide (#51, #82). starlims-lsp reports a ?name?
    marker in a SQL data source as datasource_sql_question_placeholder (from
    v0.25.0).
issues: ["#51", "#82"]
---

## Rationale

The SQL body of a SQL data source references `:PARAMETERS` values as `@name`
placeholders whose names match the declarations. Write `@name` whatever the
database platform: the builder adapts placeholders to the backend. The
`?name?` markers belong to SQL embedded in SSL strings (`SQLExecute`); they are
not substituted in a SQL data source.

## Exceptions

Placeholders inside quoted SQL literals are not substituted, in either form.

## Examples

### Good

```ssl kind=ds
:DSN := DATABASE;
:PARAMETERS sStatus := "A";

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
WHERE status = ?sStatus?
```
