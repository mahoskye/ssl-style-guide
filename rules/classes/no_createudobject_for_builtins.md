---
id: no_createudobject_for_builtins
title: CreateUdObject is not for built-in classes
domain: classes
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Do not instantiate built-in classes with `CreateUdObject`.
categories: [classes, objects]
machine: { list: avoid }
related_elements: [CreateUdObject, Email]
enforced_by: [lsp:diag.createudobject_builtin_misuse]
verification:
  basis: reference
  note: >-
    Kept from the classes pack's avoid list, which states it word for word.
    Merged: the objects pack's "Do not use CreateUdObject for built-in class
    instances." and the agent guide's quick start rule 7.
---

## Rationale

`CreateUdObject` creates dynamic objects and instances of user-defined
classes. A built-in class name passed to it is not found.

## Examples

### Good

```ssl
:DECLARE oEmail;
oEmail := Email{};
```

### Bad

```ssl
:DECLARE oEmail;
oEmail := CreateUdObject("Email");
```
