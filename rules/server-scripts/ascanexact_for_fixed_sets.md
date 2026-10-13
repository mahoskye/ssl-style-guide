---
id: ascanexact_for_fixed_sets
title: AScanExact for fixed sets of values
domain: server-scripts
status: active
level: authoritative
severity: warning
applies_to: [server_script, class]
rule: >-
  Use `AScanExact({...}, value)` when testing membership in a fixed set of
  exact values; `AScan` matches strings by prefix.
categories: [arrays, strings]
related_elements: [AScanExact, AScan]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline's control-flow bullets, with its
    explanation of AScan shortened to the second clause.
---

## Rationale

`AScan` matches strings by prefix: `"APP"` matches `"APPROVED"`, and an empty
string matches the first string element.

## Examples

### Good

```ssl
:PROCEDURE IsKnownRoute;
	:PARAMETERS sRoute;
	:RETURN AScanExact({"APPROVE", "REJECT"}, sRoute) > 0;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE IsKnownRoute;
	:PARAMETERS sRoute;
	:RETURN AScan({"APPROVE", "REJECT"}, sRoute) > 0;
:ENDPROC;
```
