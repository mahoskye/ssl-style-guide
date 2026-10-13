---
id: declare_arrays_before_use
title: Declare and initialize arrays before appending
domain: language
status: active
level: advisory
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Declare array variables before use and initialize arrays before appending.
categories: [arrays]
machine: { list: must_follow }
related_elements: [AAdd, ArrayNew]
enforced_by: [reviewer]
verification:
  basis: convention
  note: Kept from the arrays pack, which states it word for word.
---

## Rationale

A declared variable starts as `""`, not as an empty array, so appending to it
before assigning `{}` fails.

## Examples

### Good

```ssl
:DECLARE aItems;
aItems := {};
AAdd(aItems, 1);
```

### Bad

```ssl
:DECLARE aItems;
AAdd(aItems, 1);
```
