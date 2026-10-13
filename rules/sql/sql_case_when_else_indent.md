---
id: sql_case_when_else_indent
title: WHEN and ELSE indent under CASE
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  Indent `WHEN`/`ELSE` 2 spaces under `CASE`.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [reviewer]
schema:
  - path: sql.formatting.indentation.sub_clauses.case_when_else
    form: value
    value: 2
  - path: sql.formatting.statement_patterns.case.when_else
    form: value
    value: indented 2 under CASE
verification:
  basis: convention
  note: >-
    Kept from the schema, the ssl-format skill and the agent guide's quick
    reference, which all say 2. The compact reference (§1, §5) and the
    formatter at the pinned LSP put WHEN/ELSE 4 under CASE; that disagreement
    is #106 and is settled in a content change, not in this extraction.
issues: ["#106"]
---

## Rationale

`WHEN` and `ELSE` belong to their `CASE`, so they indent under it like any
other sub-clause, and `END` returns to the column of `CASE`.

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
WHEN o.status = 'C' THEN 'Complete'
ELSE 'Unknown'
END AS status_desc
```

## Notes

The examples are `text` fences because the formatter currently lays out
`CASE` with a 4-space step, so a 2-space `ssl` example would not be
formatter-clean. When #106 is settled, update `rule`, the schema values and
these examples together, and switch the examples to `ssl` fences.
