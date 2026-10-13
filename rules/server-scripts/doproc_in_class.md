---
id: doproc_in_class
title: No bare DoProc targets in class methods
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [class]
rule: >-
  Do not call `DoProc` with a bare procedure name inside class methods; it is
  a compile-time error. Use `Me:Method()` or `Base:Method()`.
categories: [procedures, classes]
machine: { list: avoid }
related_elements: [DoProc, me, base]
enforced_by: [lsp:diag.doproc_in_class]
schema:
  - path: lints.compile_errors.rules
    form: lint
    message: >-
      An unqualified DoProc target is a compile-time error inside class
      methods. Use Me:MethodName() / Base:MethodName() for methods on the
      class or its base; fully qualified 'Category.Script.Procedure' targets
      referencing deployed script procedures are allowed.
  - path: function_calls.indirect_calls.class_method_restriction
    form: text
    message: DoProc is rejected inside class methods; use Me:Method() or Base:Method() instead
verification:
  basis: reference
  note: >-
    Kept from the classes pack, which states it word for word. Merged: the
    procedures pack's "Do not use DoProc with a bare procedure name inside
    class methods; it is a compile-time error.", the schema's
    function_calls.indirect_calls.class_method_restriction, and the review and
    refactor skills' rule lists.
---

## Rationale

Inside a class method, a string-literal `DoProc` target with a single segment
is rejected when the class compiles. Methods on the class or its base are
reached through `Me:` and `Base:`.

## Exceptions

A fully qualified `DoProc("Category.Script.Procedure", {args})` that calls a
deployed script procedure compiles inside a class method. A target held in a
variable is not checked when the class compiles.

## Examples

### Good

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Increment;
	Me:Reset();
	Me:nCount += 1;
:ENDPROC;

:PROCEDURE Reset;
	Me:nCount := 0;
:ENDPROC;
```

### Bad

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Increment;
	DoProc("Reset");
	Me:nCount += 1;
:ENDPROC;

:PROCEDURE Reset;
	Me:nCount := 0;
:ENDPROC;
```

## Notes

The schema entry `lints.compile_errors.doproc_in_class` also carries a
`scope` note on two-segment and variable targets. It stays in the
hand-maintained schema until the classes domain is migrated.
