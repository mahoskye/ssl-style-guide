---
id: class_member_order
title: Class member order
domain: classes
status: active
level: advisory
severity: info
applies_to: [class]
rule: >-
  Order class members as `:INHERIT`, then the class-level `:DECLARE` fields,
  then the methods.
categories: [classes]
machine: { list: must_follow }
related_elements: [CLASS, INHERIT, DECLARE]
enforced_by: [lsp:diag.class_member_order]
schema:
  - path: lints.class_rules
    form: lint
    message: >-
      Class members are ordered :INHERIT, then class-level :DECLARE fields,
      then methods.
verification:
  basis: reference
  note: >-
    Kept from the classes pack. The earlier wording also put Constructor last
    and called the whole order a compile requirement; a class that declares
    Constructor before its other methods compiles and runs, so that part is
    now the separate convention constructor_after_methods. starlims-lsp
    reports a class-level :DECLARE after a method, or an :INHERIT after a
    :DECLARE or a method, and does not check where Constructor sits.
---

## Rationale

`:INHERIT` names the parent before anything else, and the fields come before
the methods that use them, so a reader sees the object's shape before its
behavior.

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
