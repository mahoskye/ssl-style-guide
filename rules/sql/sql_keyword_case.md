---
id: sql_keyword_case
title: SQL keywords and functions are uppercase
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Inside SQL strings, write SQL keywords and built-in functions in uppercase.
categories: [sql]
machine: { list: must_follow }
related_elements: [SQLExecute, RunSQL]
enforced_by: [lsp:fmt.sql_in_strings]
schema:
  - path: sql.formatting.keyword_case
    form: value
    value: upper
  - path: sql.formatting.function_case
    form: value
    value: upper
verification:
  basis: convention
  note: >-
    Merged from the database pack's casing item (its keyword half), the sql
    pack ("Keep SQL keyword casing distinct from SSL identifier casing."),
    the ssl-format skill, the agent guide's SQL guidance #7 and quick
    reference, and the schema. The formatter uppercases keywords and
    functions when it lays out a multi-line or over-long query.
---

## Rationale

Uppercase keywords separate the fixed SQL vocabulary from the table, column
and alias names around it, and from the mixed-case SSL code outside the
string.

## Exceptions

The formatter leaves a single-line query that fits its line exactly as
written, keyword case included, so fix such a query by hand.

## Examples

### Good

```ssl
:DECLARE sStatus, aRows;

sStatus := "Logged";
aRows := SQLExecute("
    SELECT ordno, COUNT(*) AS ntests
    FROM ordtask
    WHERE status = ?sStatus?
    GROUP BY ordno
");
```

### Bad

```ssl
:DECLARE sStatus, aRows;
sStatus := "Logged";
aRows := SQLExecute("
    select ordno, count(*) as ntests
    from ordtask
    where status = ?sStatus?
    group by ordno
");
```
