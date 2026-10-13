---
id: datasource_ssl_comment_syntax
title: SSL data sources use SSL comments
domain: data-sources
status: active
level: authoritative
severity: warning
applies_to: [ssl_data_source]
rule: >-
  In an SSL data source, comments are SSL comments: they end at the first `;`,
  and `*/` does not close them.
categories: [data-sources]
enforced_by: [lsp:diag.comment_swallows_code]
schema:
  - path: module_structure.data_source_modules.file_types.ssl_data_source.comments.syntax
    form: value
    value: ssl
verification:
  basis: reference
  note: >-
    Kept from the schema's ssl_data_source comments entry and the
    ssl-new-datasource skill, which contrasts the two data-source modes.
---

## Rationale

The body of an SSL data source is SSL, so the SSL comment rules apply
throughout, including the optional header comment. A `*/` there is ordinary
comment text: a comment that ends with `*/` and no `;` runs on and swallows
the statement after it, which then never runs while still reading as live
code. `*/;` is correct in an SSL data source and wrong in a SQL one (see
datasource_sql_semicolon).

## Examples

### Good

```ssl kind=ds
/* DATA SOURCE: SampleList (SSL);
:PARAMETERS sStatus := "A";

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = ?sStatus?");
```

### Bad

```ssl kind=ds
/* DATA SOURCE: SampleList (SSL) */
:PARAMETERS sStatus := "A";

:RETURN SQLExecute("SELECT sample_id FROM sample WHERE status = ?sStatus?");
```
