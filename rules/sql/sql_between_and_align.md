---
id: sql_between_and_align
title: A broken BETWEEN range aligns its AND under BETWEEN
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  When a `BETWEEN ... AND` range breaks across lines, align its `AND` under
  `BETWEEN`.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [reviewer]
schema:
  - path: sql.formatting.statement_patterns.where.between_and
    form: value
    value: aligned under BETWEEN keyword
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill ("BETWEEN...AND: the AND aligns under
    BETWEEN") and the schema. The formatter at the pinned LSP joins a short
    range back onto one line, so a reviewer applies the rule to ranges that
    have to break.
---

## Rationale

The `AND` of a range is not a condition separator. Aligning it under
`BETWEEN` keeps it from reading as the start of a new `AND` condition, which
sits 2 spaces in.

## Examples

### Good

```text
WHERE o.logdate BETWEEN TO_DATE('2026-01-01', 'YYYY-MM-DD')
                AND TO_DATE('2026-12-31', 'YYYY-MM-DD')
```

### Bad

```text
WHERE o.logdate BETWEEN TO_DATE('2026-01-01', 'YYYY-MM-DD')
  AND TO_DATE('2026-12-31', 'YYYY-MM-DD')
```
