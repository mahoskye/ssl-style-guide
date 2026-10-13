---
id: constructor_after_methods
title: Constructor after the regular methods (convention)
domain: classes
status: active
level: style_only
severity: info
applies_to: [class]
rule: >-
  By convention, declare `Constructor` after the regular methods, as the last
  method of the class; a class that declares it first compiles and runs the
  same way.
categories: [classes]
machine: { list: must_follow }
related_elements: [CLASS, constructor]
enforced_by: [reviewer]
schema:
  - path: classes.signature.notes
    form: text
    message: >-
      By convention, Constructor is declared after the regular methods; a
      class that declares it first compiles and runs the same way.
verification:
  basis: observed
  note: >-
    Split from class_member_order, which used to call Constructor-last a
    compile requirement. Checked on STARLIMS 12: a class that declares
    Constructor before its other methods compiles and runs. The reference
    page for :CLASS states the same convention.
---

## Rationale

Keeping `Constructor` in one predictable place makes a class easy to scan.
The position has no effect on how the class compiles or runs, so an existing
class that declares `Constructor` first does not need reordering.

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
:DECLARE nCount;

:PROCEDURE Constructor;
	Me:nCount := 0;
:ENDPROC;

:PROCEDURE Increment;
	Me:nCount += 1;
:ENDPROC;
```
