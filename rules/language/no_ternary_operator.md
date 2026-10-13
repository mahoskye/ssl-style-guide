---
id: no_ternary_operator
title: Use IIf, not a ternary operator
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  The C ternary `cond ? a : b`: use `IIf(bCondition, vTrue, vFalse)`
  (exactly three arguments; both branches are evaluated).
categories: [operators]
machine: { foundation: does_not_have }
related_elements: [IIf]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the foundation's "SSL Does Not Have" list, which states it word
    for word. starlims-lsp reports the `?` only as an unknown token.
---

## Rationale

SSL has no `?:` operator. `IIf` is an ordinary function, so both value
arguments are evaluated before it chooses one.

## Examples

### Good

```ssl
:DECLARE nCount, sLabel;
nCount := 0;
sLabel := IIf(nCount > 0, "some", "none");
```

### Bad

```text
sLabel := nCount > 0 ? "some" : "none";
```
