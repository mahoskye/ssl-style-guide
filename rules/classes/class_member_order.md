---
id: class_member_order
title: Class member order
domain: classes
status: active
level: authoritative
severity: info
applies_to: [class]
rule: >-
  Keep class member order as `:INHERIT`, `:DECLARE`, regular methods, then
  `Constructor`.
categories: [classes]
machine: { list: must_follow }
related_elements: [CLASS, INHERIT, DECLARE, constructor]
enforced_by: [lsp:diag.class_member_order]
schema:
  - path: lints.class_rules
    form: lint
    message: >-
      Tooling enforces the successful class member order used by this guide:
      :INHERIT, :DECLARE, regular methods, then Constructor.
  - path: classes.signature.notes
    form: text
    message: Constructor must be declared after regular methods.
verification:
  basis: reference
  note: >-
    Kept from the classes pack, which states it word for word. Merged: the
    schema lint class_member_order (word for word) and
    classes.signature.notes, module_structure.class_modules, the agent guide's
    class definition section, and the new-class skill's ":DECLARE class
    fields must appear before methods" and "Constructor must be the last
    procedure in the class". starlims-lsp reports a :DECLARE after a method.
---

## Rationale

A class compiles only with its members in this order. Fields come before the
methods that use them, and `Constructor` comes last.

## Examples

### Good

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Increment;
	Me:nCount += 1;
:ENDPROC;

:PROCEDURE Constructor;
	Me:nCount := 0;
:ENDPROC;
```

### Bad

```ssl
:CLASS Counter;

:PROCEDURE Increment;
	Me:nCount += 1;
:ENDPROC;

:DECLARE nCount;
```
