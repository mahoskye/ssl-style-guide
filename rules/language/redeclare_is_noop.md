---
id: redeclare_is_noop
title: Re-declaring a variable keeps its value
domain: language
status: active
level: authoritative
severity: hint
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Re-declaring an existing variable with `:DECLARE` is silently ignored — no
  error, existing value preserved.
categories: [procedures]
related_elements: [DECLARE]
enforced_by: [lsp:diag.redeclare_is_noop]
schema:
  - path: lints.variable_behavior.rules.redeclare_is_noop.message
    form: text
verification:
  basis: reference
  note: >-
    Kept from the schema's lints.variable_behavior entry, which states it word
    for word. The agent guide's declaration section says the same.
---

## Rationale

A second `:DECLARE` does not reset the variable. Code that relies on it to
start fresh keeps the old value.

## Examples

### Good

```ssl
:DECLARE nCount;

nCount := 5;
nCount := 0;
```

### Bad

```ssl
:DECLARE nCount;
nCount := 5;
:DECLARE nCount;
```
