---
id: no_rename_in_behavior_preserving_refactor
title: No renames in a behavior-preserving refactor
domain: naming
status: active
level: advisory
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Do not rename values in behavior-preserving refactors unless the refactor
  scope includes naming cleanup.
categories: [naming]
machine: { list: avoid }
enforced_by: [reviewer]
verification:
  basis: convention
  note: Kept from the naming pack's avoid list, which states it word for word.
---

## Rationale

A rename touches every use of a name, which buries the real change in a large
diff and can break callers that reach the name dynamically.

## Examples

### Good

```text
Refactor scope: extract the validation into a procedure. Variable names are
left as they were.
```

### Bad

```text
Refactor scope: extract the validation into a procedure. The diff also
renames cnt to nCount across the file.
```
