---
id: assignment_operator
title: Assignment is :=
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `=` assignment: assignment is `:=` (plus `+=`, `-=`, ...); `x = y` is a
  comparison expression, never an assignment.
categories: [operators]
machine: { list: must_follow, foundation: does_not_have }
related_elements: [assignment, equals]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the foundation's "SSL Does Not Have" list. Merged: the
    operators pack's "Use := for assignment.". A `x = y;` statement is a
    comparison whose result is discarded; starlims-lsp v0.24.0 does not
    report it.
---

## Rationale

`=` is the loose equality operator. Written as a statement, `nCount = 1;`
compares and throws the result away, so the variable never changes.

## Examples

### Good

```ssl
:DECLARE nCount;
nCount := 1;
```

### Bad

```ssl
:DECLARE nCount;
nCount = 1;
```
