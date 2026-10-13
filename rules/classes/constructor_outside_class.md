---
id: constructor_outside_class
title: Constructor only inside a class
domain: classes
status: active
level: authoritative
severity: warning
applies_to: [server_script]
rule: >-
  Use `Constructor` only inside a `:CLASS` definition.
categories: [classes]
related_elements: [constructor]
enforced_by: [lsp:diag.constructor_outside_class]
schema:
  - path: lints.coding_standards
    form: lint
    message: Constructor syntax is only meaningful inside a :CLASS definition.
verification:
  basis: reference
  note: >-
    Kept from the schema lint constructor_outside_class, whose message stays
    word for word.
---

## Rationale

`Constructor` is the reserved name of a class's constructor. In a script it is
an ordinary procedure name that nothing calls as a constructor.

## Examples

### Good

```ssl
:PROCEDURE Initialize;
	:RETURN 1;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Constructor;
	:RETURN;
:ENDPROC;
```
