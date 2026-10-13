---
id: sql_case_then_break
title: A broken THEN value indents under its WHEN
domain: sql
status: active
level: style_only
severity: info
applies_to: [embedded_sql, sql_data_source]
rule: >-
  When a `THEN` value breaks to a new line, indent it 4 spaces under its
  `WHEN`.
categories: [sql]
related_elements: [SQLExecute]
enforced_by: [reviewer]
schema:
  - path: sql.formatting.statement_patterns.case.then_value
    form: value
    value: inline when short; next line (indented 4 under WHEN) when long
verification:
  basis: convention
  note: >-
    Kept from the ssl-format skill and the schema's then_value, which say
    4 under WHEN, and the compact reference (§5.2), which keeps THEN at the
    end of the WHEN line and puts the value on the next line (#106). The
    formatter at the pinned LSP does not produce this layout: it joins the
    value back onto the WHEN line or wraps it at the line limit, so the
    examples are `text` fences and a reviewer applies the rule.
issues: ["#106"]
---

## Rationale

A long result reads as part of its `WHEN` when it sits one step under it, and
the next `WHEN` still starts at the branch column.

## Examples

### Good

```text
CASE
    WHEN status = 'Complete' AND result_value IS NOT NULL THEN
        ROUND(result_value / baseline_value * 100, 2)
    WHEN status = 'Complete' AND result_value IS NULL THEN
        0
    ELSE -1
END AS pct_of_baseline
```

### Bad

```text
CASE
    WHEN status = 'Complete' AND result_value IS NOT NULL THEN
    ROUND(result_value / baseline_value * 100, 2)
    WHEN status = 'Complete' AND result_value IS NULL THEN
    0
    ELSE -1
END AS pct_of_baseline
```
