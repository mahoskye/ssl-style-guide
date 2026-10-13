---
id: null_literal_is_nil
title: The absent-value literal is NIL
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `NULL`: the absent-value literal is `NIL` (and the boolean literals are
  `.T.` and `.F.`).
categories: [types]
machine: { list: must_follow, foundation: does_not_have }
related_elements: [nil, "true", "false"]
enforced_by: [reviewer]
schema:
  - path: expressions.nil_literal
    form: value
    value: NIL
verification:
  basis: reference
  note: >-
    Kept from the foundation's "SSL Does Not Have" entry. Merged: the types
    pack's "Use NIL for the nil literal and .T./.F. for booleans." and the
    schema's expressions.nil_literal (special_literals lists the same
    literals as reference data). A bare NULL is an undeclared variable, not a
    literal.
---

## Rationale

`NULL`, `null`, `true` and `false` are not literals in SSL; they read as
variable names. The literals are `NIL`, `.T.` and `.F.`.

## Examples

### Good

```ssl
:DECLARE vValue, bDone;
vValue := NIL;
bDone := .F.;
```

### Bad

```text
vValue := NULL;
bDone := false;
```
