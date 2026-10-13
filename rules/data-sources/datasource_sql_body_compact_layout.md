---
id: datasource_sql_body_compact_layout
title: SQL data-source queries use the canonical compact layout
domain: data-sources
status: active
level: style_only
severity: info
applies_to: [sql_data_source]
rule: >-
  Lay out the query body of a SQL data source in the canonical compact SQL
  style, the same as SQL embedded in SSL strings.
categories: [data-sources]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the scope note of the SQL canonical compact reference and the
    ssl-format skill. The formatter does not rewrite data source files, so
    reviewers apply it.
---

## Rationale

The canonical compact reference defines one SQL layout for the repository.
Its scope note says the layout also applies to the query body of a SQL data
source, even though the file's header (builder directives and `:PARAMETERS`)
has its own structure.

## Examples

### Good

```ssl kind=ds
:DSN := DATABASE;
:PARAMETERS sStatus := "A";

SELECT sampleid, status
FROM sample
WHERE status = @sStatus
  AND note <> 'x'
ORDER BY sampleid
```

### Bad

```ssl kind=ds
:DSN := DATABASE;
:PARAMETERS sStatus := "A";

select sampleid,status from sample where status=@sStatus and note<>'x' order by sampleid
```
