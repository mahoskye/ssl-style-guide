---
id: underscore_private_convention
title: Underscore prefix marks private members
domain: classes
status: active
level: style_only
severity: info
applies_to: [class]
rule: >-
  Underscore-prefixed members (`_name`) are excluded from reflection — this is
  the SSL private convention.
categories: [classes]
related_elements: [DECLARE, PROCEDURE]
enforced_by: [reviewer]
schema:
  - path: lints.class_rules
    form: lint
    message: >-
      Underscore-prefixed members (_name) are excluded from reflection — this
      is the SSL private convention.
verification:
  basis: reference
  note: >-
    Kept from the schema lint underscore_private_convention, which states it
    word for word. The new-class skill and the agent guide say the same.
    starlims-lsp has no entry for it.
---

## Rationale

Class methods are always public, and access modifiers have no effect on them.
The `_` prefix is the only way to keep a member out of reflection-based
access.

## Examples

### Good

```ssl
:CLASS Counter;
:DECLARE _nCount;

:PROCEDURE Increment;
	Me:_nCount += 1;
:ENDPROC;
```

### Bad

```text
:CLASS Counter;
:DECLARE nInternalCount;

/*@private;
:PROCEDURE Recount;
```

The bad class tries to hide its internals with a field name and an access
modifier; neither keeps them out of reflection.
