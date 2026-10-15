---
id: loop_counter_names
title: Single-letter loop counters
domain: naming
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Loop counters may be `i`, `j`, `k`, `x`, `y` or `z` without a prefix only
  when declared; in a script that calls other scripts, prefer a
  script-specific name such as `nSampleIdx`.
categories: [naming]
related_elements: [FOR, DECLARE]
enforced_by: [reviewer]
schema:
  - path: lints.hungarian_notation.exceptions.loop_counters
    form: value
    value: [i, j, k, x, y, z]
verification:
  basis: convention
  note: >-
    Kept from the schema comment on
    lints.hungarian_notation.exceptions.loop_counters ("only when declared;
    prefer a script-specific name in a script that calls other scripts"),
    with the agent guide's and refactoring guide's example (nSampleIdx)
    merged in.
---

## Rationale

An undeclared counter is looked up in the callers' scopes, so it can collide
with a caller's variable of the same name.

## Examples

### Good

```ssl
:DECLARE i, nTotal;

nTotal := 0;

:FOR i := 1 :TO 3;
	nTotal += i;
:NEXT;
```

### Bad

```ssl
:DECLARE nTotal;
nTotal := 0;
:FOR i := 1 :TO 3;
	nTotal += i;
:NEXT;
```
