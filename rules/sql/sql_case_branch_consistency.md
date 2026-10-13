---
id: sql_case_branch_consistency
title: A CASE block keeps all branches inline or all broken
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Within one `CASE` block, keep all `WHEN`/`THEN` branches inline or break
  them all; do not mix. `ELSE` may stay inline when its value is short.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [reviewer]
schema:
  - path: sql.formatting.statement_patterns.case.consistency
    form: value
    value: all branches inline or all broken within one CASE block
  - path: sql.formatting.statement_patterns.case.else_exception
    form: value
    value: ELSE value may stay inline when short
verification:
  basis: convention
  note: >-
    Merged from the ssl-format skill (two bullets: the consistency rule and
    the ELSE exception), the agent guide's "CASE consistency" paragraph,
    which states both together, and the schema.
issues: ["#106"]
---

## Rationale

A `CASE` whose branches share one shape reads as a table of conditions and
results. Mixing inline and broken branches hides which results belong to
which conditions.

## Exceptions

A short `ELSE` value may stay on the `ELSE` line even when the `WHEN`
branches are broken.

## Examples

### Good

```text
CASE
  WHEN o.status = 'L' THEN 'Logged'
  WHEN o.status = 'C' THEN 'Complete'
  ELSE 'Unknown'
END AS status_desc
```

### Bad

```text
CASE
  WHEN o.status = 'L' THEN 'Logged'
  WHEN o.status = 'C'
    THEN 'Complete'
  ELSE 'Unknown'
END AS status_desc
```

## Notes

`text` fences, for the reason given in `sql_case_when_else_indent`.
