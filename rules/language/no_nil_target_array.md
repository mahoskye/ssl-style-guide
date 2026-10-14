---
id: no_nil_target_array
title: No NIL target for mutating array helpers
domain: language
status: active
level: authoritative
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Do not pass `NIL` as the target array to mutating array helpers.
categories: [arrays]
machine: { list: avoid }
related_elements: [AAdd, AFill, DelArray]
enforced_by: [reviewer]
verification:
  basis: reference
  note: Kept from the arrays pack's avoid list, which states it word for word.
---

## Rationale

`AAdd`, `AFill` and the other mutating helpers change the array they are
given. With `NIL` there is no array to change, and the call fails.

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
aItems := NIL;
AAdd(aItems, 1);
```
