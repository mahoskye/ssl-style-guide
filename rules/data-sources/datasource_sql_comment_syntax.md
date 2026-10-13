---
id: datasource_sql_comment_syntax
title: SQL data sources use SQL comments
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [sql_data_source]
rule: >-
  Use SQL comment syntax (`--` and `/* ... */`) in SQL data-source bodies, not
  the SSL comment form.
categories: [data-sources]
machine: { list: must_follow }
enforced_by: [reviewer]
schema:
  - path: module_structure.data_source_modules.file_types.sql_data_source.comments.syntax
    form: value
    value: sql
verification:
  basis: reference
  note: >-
    Kept from the data-sources pack. Matches the schema's sql_data_source
    comments entry, the agent guide and the ssl-new-datasource skill (#50).
issues: ["#50"]
---

## Rationale

The body of a SQL data source is SQL. A comment is `--` to the end of the line,
or `/* ... */` closed by `*/`. The SSL form, `/*` closed by the first `;`, is
not part of this file type: an unterminated `/*` reaches the database as
malformed SQL and fails there.

## Exceptions

Semicolons inside SQL comments and inside quoted SQL literals (for example
`'all;msoffice->pdf'`) are content. Comments may appear anywhere, including a
banner before the builder directives. Optimizer-hint comments (`/*+ ... */`)
are kept as written.

## Examples

### Good

```ssl kind=ds
/* DATA SOURCE: SampleList (SQL)
   PURPOSE: samples by status */
-- Comment text may contain ; freely
:DSN := DATABASE;
:PARAMETERS sStatus := "A";

SELECT sampleid, status
FROM sample
WHERE status = @sStatus
```

### Bad

```ssl kind=ds
/* DATA SOURCE: SampleList (SQL);
:DSN := DATABASE;
:PARAMETERS sStatus := "A";

SELECT sampleid, status
FROM sample
WHERE status = @sStatus
```
