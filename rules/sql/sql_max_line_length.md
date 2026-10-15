---
id: sql_max_line_length
title: SQL lines target about 90 characters
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Keep SQL lines to about 90 characters, breaking at logical points.
categories: [sql]
related_elements: [SQLExecute, RunSQL]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.max_line_length
    form: value
    value: 90
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill ("~90 char line target; break at logical
    points"), the agent guide's quick reference and the compact reference.
    The formatter reflows a single-line query that overflows its line.
---

## Rationale

About 90 characters fits a side-by-side diff and a review pane without
wrapping. Breaking at clause and list boundaries keeps each line meaningful
on its own.

## Exceptions

A single token that cannot fit, such as a long string literal, leaves its line
over-long; tokens are never split.

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;

sStatus := "Logged";
aRows := SQLExecute("
    SELECT ordno, testcode, status, logdate, result, analyst, department
    FROM ordtask
    WHERE status = ?sStatus?
");
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("SELECT ordno, testcode, status, logdate, result, analyst, department FROM ordtask WHERE status = ?sStatus?");
```
