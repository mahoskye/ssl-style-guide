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
  - path: lints.compile_errors.rules.doproc_in_class.message
    form: text
    message: >-
      An unqualified DoProc target is a compile-time error inside class
      methods. Use Me:MethodName() / Base:MethodName() for methods on the
      class or its base; fully qualified 'Category.Script.Procedure' targets
      referencing deployed script procedures are allowed.
  - path: function_calls.indirect_calls.class_method_restriction
    form: text
    message: >-
      A DoProc target that is a bare procedure name is rejected inside class
      methods; use Me:Method() or Base:Method() instead. Fully qualified
      'Category.Script.Procedure' targets compile and run.
verification:
  basis: reference
  note: >-
    Kept from the classes pack, which states it word for word. Merged: the
    procedures pack's "Do not use DoProc with a bare procedure name inside
    class methods; it is a compile-time error.", the schema's
    function_calls.indirect_calls.class_method_restriction, and the review and
    refactor skills' rule lists. Checked on STARLIMS 12: inside a class
    method, a fully qualified DoProc target compiles and runs, and so does
    ExecFunction with a Category.Script.Procedure target.
---

## Rationale

Inside a class method, a string-literal `DoProc` target with a single segment
is rejected when the class compiles. Methods on the class or its base are
reached through `Me:` and `Base:`.

## Exceptions

A fully qualified `DoProc("Category.Script.Procedure", {args})` that calls a
deployed script procedure compiles and runs inside a class method, and so does
`ExecFunction("Category.Script.Procedure", {args})`. A target held in a
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
`scope` note on two-segment and variable targets. The record supplies only
the entry's message; the slug, severity and `scope` note stay in
`rules/schema-base.yaml`.
