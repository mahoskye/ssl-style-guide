---
id: one_statement_per_line
title: One statement per line
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use one statement per line.
categories: [formatting, control-flow]
machine: { list: must_follow }
enforced_by: [reviewer]
schema:
  - path: formatting.one_statement_per_line
    form: value
    value: true
verification:
  basis: convention
  note: >-
    Kept from the formatting pack, which states it word for word. Merged: the
    first half of the control-flow pack's "Keep one statement per line and
    terminate every statement with a semicolon.", the skills' "Use one
    statement per line", and the schema's formatting.one_statement_per_line.
    The formatter splits a line that holds two statements.
---

## Rationale

One statement per line keeps diffs, diagnostics and breakpoints aligned with
single statements.

## Examples

### Good

```ssl
:DECLARE nCount, nTotal;
nCount := 0;
nTotal := 0;
```

### Bad

```ssl
:DECLARE nCount, nTotal;
nCount := 0; nTotal := 0;
```
