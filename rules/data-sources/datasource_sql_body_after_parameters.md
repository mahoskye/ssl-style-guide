---
id: datasource_sql_body_after_parameters
title: The SQL body follows :PARAMETERS
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [sql_data_source]
rule: >-
  In a SQL data source, put the SQL body after the `:PARAMETERS` line; SQL text
  placed before it is discarded.
categories: [data-sources]
related_elements: [PARAMETERS]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the schema's sql_data_source structure_note, which the agent
    guide repeats.
---

## Rationale

The builder reads a SQL data source as a header (comments, builder directives
and `:PARAMETERS`) followed by the query. SQL text placed before
`:PARAMETERS` is discarded during preprocessing, so that part of the query
never runs.

## Exceptions

Builder directives and comments may come before `:PARAMETERS`. A SQL data
source with no parameters has no `:PARAMETERS` line, and its query follows the
directives.

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
SELECT sampleid, status
FROM sample
:PARAMETERS sStatus := "A";

WHERE status = @sStatus
```
