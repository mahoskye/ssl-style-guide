---
id: sql_case_then_break
title: A broken THEN value indents under its WHEN
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  When a `THEN` value breaks to a new line, indent it one level under its
  `WHEN`.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [reviewer]
schema:
  - path: sql.formatting.statement_patterns.case.then_value
    form: value
    value: inline when short; next line (indented 2 under WHEN) when long
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill. The schema's then_value says the same,
    with "indented 2 under WHEN" for the step.
issues: ["#106"]
---

## Rationale

A long result reads as part of its `WHEN` when it sits one step under it, and
the next `WHEN` still starts at the branch column.

## Examples

### Good

```text
CASE
  WHEN o.status = 'L'
    THEN 'Logged, waiting for the first test to start'
  WHEN o.status = 'C'
    THEN 'Complete, all tests reviewed and released'
  ELSE 'Unknown'
END AS status_desc
```

### Bad

```text
CASE
  WHEN o.status = 'L'
  THEN 'Logged, waiting for the first test to start'
  WHEN o.status = 'C'
  THEN 'Complete, all tests reviewed and released'
  ELSE 'Unknown'
END AS status_desc
```

## Notes

`text` fences, for the reason given in `sql_case_when_else_indent`.
