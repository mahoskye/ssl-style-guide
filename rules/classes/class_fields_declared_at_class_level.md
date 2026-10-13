---
id: class_fields_declared_at_class_level
title: Class fields are declared at class level
domain: classes
status: active
level: authoritative
severity: warning
applies_to: [class]
rule: >-
  Declare class fields with `:DECLARE` at class level, not inside methods.
categories: [classes]
related_elements: [DECLARE, CLASS]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the new-class skill ("Fields declared with :DECLARE at class
    level (not inside methods)"). The agent guide's class section says a
    class contains :DECLARE statements and :PROCEDURE definitions, and a
    :DECLARE inside a method declares a local.
---

## Rationale

Only a `:DECLARE` at class level creates a field. The same statement inside a
method declares a local variable that disappears when the method returns, so
`Me:` never sees it.

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

:PROCEDURE Reset;
	:DECLARE nCount;
	nCount := 0;
:ENDPROC;
```
