---
id: sql_ssl_embedding_indent
title: The SQL block sits 4 spaces inside the string
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql]
rule: >-
  Indent the whole SQL block 4 spaces inside the SSL string literal.
categories: [sql]
related_elements: [SQLExecute, RunSQL]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.ssl_embedding.indent
    form: value
    value: 4
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill and the agent guide's SQL quick reference
    ("SQL block indented 4 spaces inside the SSL string literal"), the schema
    and the compact reference. Matches formatter output at the pinned LSP.
---

## Rationale

The 4-space indent sets the SQL off from the SSL statement around it. Every
other SQL indent (clauses at 0, sub-clauses at 2) is measured from it.

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;

sStatus := "Logged";
aRows := SQLExecute("
    SELECT ordno, testcode
    FROM ordtask
    WHERE status = ?sStatus?
");
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("
SELECT ordno, testcode
FROM ordtask
WHERE status = ?sStatus?
");
```
