---
id: me_inside_class_only
title: Me only inside a class
domain: classes
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Use `Me` only inside a `:CLASS` definition.
categories: [classes]
related_elements: [me]
enforced_by: [lsp:diag.me_outside_class]
verification:
  basis: reference
  note: >-
    Kept from the agent guide's Me form note ("Can only be used inside a :CLASS
    definition").
---

## Rationale

`Me` is the current class instance. A script has no instance for it to name.

## Exceptions

A library compiled into a class through `:INCLUDE` may use `Me`.

## Examples

### Good

```ssl
:CLASS Greeter;
:DECLARE sName;

:PROCEDURE Greeting;
	:RETURN "Hello " + Me:sName;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Greeting;
	:RETURN "Hello " + Me:sName;
:ENDPROC;
```
