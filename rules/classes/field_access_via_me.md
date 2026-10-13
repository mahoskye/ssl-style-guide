---
id: field_access_via_me
title: Qualify class fields with Me or Base
domain: classes
status: active
level: authoritative
severity: warning
applies_to: [class]
rule: >-
  Inside class methods, access fields through `Me:fieldName` or
  `Base:fieldName`.
categories: [classes]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [me, base, DECLARE]
enforced_by: [lsp:diag.unqualified_field_assignment]
schema:
  - path: classes.fields.access_rule
    form: text
    message: |
      Inside class methods, :DECLARE class fields must be qualified with
      Me:fieldName (or Base:fieldName for an inherited parent field).
      A bare identifier resolves to a local variable or :PARAMETERS entry,
      not the class field, so an unqualified assignment silently creates a
      local and leaves the field unchanged.
verification:
  basis: reference
  note: >-
    Kept from the foundation bullet, which states it word for word. Merged:
    the classes pack's "Access class fields through Me:fieldName or
    Base:fieldName inside methods." and its avoid item "Do not assign to
    class fields with bare identifiers inside methods.", the review and
    refactor skills, and the schema's classes.fields.access_rule.
---

## Rationale

A bare name inside a method follows normal variable lookup: local, then the
callers' scopes, then publics. It never reaches the field, so a bare write
leaves the field unchanged and a bare read can raise `Variable [name] is
undefined!`.

## Examples

### Good

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Reset;
	Me:nCount := 0;
:ENDPROC;
```

### Bad

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Reset;
	nCount := 0;
:ENDPROC;
```
