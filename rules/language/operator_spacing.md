---
id: operator_spacing
title: Spaces around binary operators
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use spaces around assignment, arithmetic, comparison, and logical operators.
categories: [formatting, operators]
machine: { list: must_follow }
enforced_by: [lsp:fmt.operator_spacing]
schema:
  - path: formatting.spaces.around_assignment
    form: value
    value: true
  - path: formatting.spaces.around_operators
    form: value
    value: true
  - path: expressions.operator_spacing
    form: value
    value: space-around
verification:
  basis: convention
  note: >-
    Kept from the formatting and operators packs, which state it word for
    word. The schema's spacing values say the same.
---

## Rationale

Spaced operators separate the operands at a glance, and the formatter
produces this layout.

## Examples

### Good

```ssl
:DECLARE nTotal;

nTotal := 1 + 2;
```

### Bad

```ssl
:DECLARE nTotal;
nTotal:=1+2;
```
