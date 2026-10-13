---
id: step_spacing
title: A space before :STEP
domain: language
status: active
level: style_only
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Put a space before `:STEP` in `:FOR` headers.
categories: [loops]
machine: { list: must_follow }
related_elements: [FOR, STEP]
enforced_by: [lsp:diag.step_spacing]
schema:
  - path: formatting.spaces.before_step_keyword
    form: value
    value: true
verification:
  basis: convention
  note: >-
    Kept from the loops pack, which states it word for word. Merged: gotcha
    16 and the schema's formatting.spaces.before_step_keyword.
---

## Rationale

Without the space, `9:STEP` reads as member access on the limit expression
rather than as the `:STEP` keyword.

## Examples

### Good

```ssl
:DECLARE i, nTotal;
nTotal := 0;
:FOR i := 1 :TO 9 :STEP 2;
	nTotal += i;
:NEXT;
```

### Bad

```ssl
:DECLARE i, nTotal;
nTotal := 0;
:FOR i := 1 :TO 9:STEP 2;
	nTotal += i;
:NEXT;
```
