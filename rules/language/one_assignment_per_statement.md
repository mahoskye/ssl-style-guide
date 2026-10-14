---
id: one_assignment_per_statement
title: One assignment per statement
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Prefer one assignment per line; use a chained assignment only when every
  target should receive the same value.
categories: [operators]
related_elements: [assignment]
enforced_by: [reviewer]
schema:
  - path: expressions.assignment_semantics.style
    form: text
    message: Prefer one assignment per line; use a chained assignment only when every target should receive the same value
verification:
  basis: convention
  note: >-
    Kept from the schema's expressions.assignment_semantics.style, which
    states it word for word. The agent guide's operators summary says the
    same. An assignment is an expression that evaluates to the assigned
    value, so a chained assignment is valid.
---

## Rationale

Assignment is right-associative and evaluates to the assigned value, so
`sStatus := sDefault := "PENDING";` is valid. Chaining unrelated targets hides
the second assignment inside the first.

## Examples

### Good

```ssl
:DECLARE sStatus, sDefault;

sStatus := sDefault := "PENDING";
```

### Bad

```ssl
:DECLARE nCount, nTotal;
nTotal := (nCount := 5) * 2;
```
