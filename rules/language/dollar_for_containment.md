---
id: dollar_for_containment
title: Use $ for containment tests
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use `$` for containment tests.
categories: [strings]
machine: { list: must_follow }
related_elements: [dollar, At]
enforced_by: [reviewer]
verification:
  basis: convention
  note: Kept from the strings pack, which states it word for word.
---

## Rationale

`sNeedle $ sHaystack` says "contains" directly. A position search compared
with zero says the same thing less plainly.

## Examples

### Good

```ssl
:DECLARE sStatus, bFound;
sStatus := "Logged";
bFound := "Log" $ sStatus;
```

### Bad

```ssl
:DECLARE sStatus, bFound;
sStatus := "Logged";
bFound := At("Log", sStatus) > 0;
```
