---
id: datasource_sql_semicolon
title: No stray semicolons in a SQL data source
domain: data-sources
status: active
level: authoritative
severity: error
applies_to: [sql_data_source]
rule: >-
  In a SQL data source, a semicolon only ends a builder directive or
  `:PARAMETERS`; the body runs as one SQL command, so any other semicolon
  outside a comment or string literal is misplaced.
categories: [data-sources]
enforced_by: [lsp:diag.datasource_sql_semicolon]
verification:
  basis: observed
  note: >-
    Kept from the ssl-new-datasource skill. The server refuses the whole
    document with "Invalid SQL statement: remove any misplaced semicolons(;)"
    (#50).
issues: ["#50"]
---

## Rationale

A SQL data source's body runs as one SQL command, so a semicolon that does not
end a builder directive or `:PARAMETERS` is a stray statement separator. The
server refuses the whole document:
`Invalid SQL statement: remove any misplaced semicolons(;)`. The common case is
a banner ended with `*/;`, which is correct in an SSL data source and wrong in
a SQL one. Other cases are a `;` on a line of its own, a doubled `;;`, and a
trailing `;` after the query.

## Exceptions

Semicolons inside SQL comments and quoted SQL literals are content.

## Examples

### Good

```ssl kind=ds
/* DATA SOURCE: SampleList (SQL) */
:DSN := DATABASE;
:PARAMETERS sStatus := "A";

SELECT sampleid, status
FROM sample
WHERE status = @sStatus
```

### Bad

```ssl kind=ds
/* DATA SOURCE: SampleList (SQL) */;
:DSN := DATABASE;
:PARAMETERS sStatus := "A";

SELECT sampleid, status
FROM sample
WHERE status = @sStatus
```

```ssl kind=ds
:DSN := DATABASE;
:PARAMETERS sStatus := "A";

SELECT sampleid, status
FROM sample
WHERE status = @sStatus;
```
