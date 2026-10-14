---
id: numeric_type
title: One numeric type
domain: language
status: active
level: authoritative
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  SSL has one numeric type for whole and fractional values. The underlying
  native type varies with the value (whole numbers report `System.Int32`,
  fractions `System.Double`).
categories: [types]
related_elements: [number, Integer]
enforced_by: [reviewer]
schema:
  - path: lints.variable_behavior.rules.numeric_type.message
    form: text
verification:
  basis: reference
  note: >-
    Kept from the schema's lints.variable_behavior entry, which states it word
    for word. The agent guide's number details say the same. starlims-lsp has
    no entry for it.
---

## Rationale

There is no integer type, so division always gives a fractional result
(`5 / 2` is `2.5`). The native `:` members differ between whole and fractional
values.

## Examples

### Good

```ssl
:DECLARE nHalf;

nHalf := Integer(5 / 2);
```

### Bad

```text
nHalf := 5 / 2;
```

The bad line expects integer division and gets `2.5`.
