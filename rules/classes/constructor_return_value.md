---
id: constructor_return_value
title: A Constructor returns no value
domain: classes
status: active
level: authoritative
severity: error
applies_to: [class]
rule: >-
  `:RETURN` inside a `Constructor` cannot return a value.
categories: [classes]
related_elements: [constructor, RETURN]
enforced_by: [lsp:diag.constructor_return_value]
schema:
  - path: lints.compile_errors.rules.constructor_return_value.message
    form: text
    message: ":RETURN inside a Constructor cannot return a value."
verification:
  basis: reference
  note: >-
    Kept from the schema's compile_errors entry constructor_return_value, which
    states it word for word. The agent guide's class definition section says
    the same.
---

## Rationale

`CreateUdObject` returns the new instance. A value returned from the
constructor has nowhere to go, so it is rejected.

## Examples

### Good

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Constructor;
	Me:nCount := 0;
:ENDPROC;
```

### Bad

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Constructor;
	Me:nCount := 0;
	:RETURN Me:nCount;
:ENDPROC;
```
