---
id: inherit_qualified_name
title: :INHERIT names the parent with its category
domain: classes
status: active
level: authoritative
severity: error
applies_to: [class]
rule: >-
  Write `:INHERIT` with the full `Category.ClassName` of the parent class; a
  plain class name is a compile-time error.
categories: [classes]
machine: { list: must_follow }
related_elements: [INHERIT]
enforced_by: [lsp:diag.inherit_qualified_name]
schema:
  - path: lints.class_rules
    form: lint
    message: >-
      :INHERIT requires the full Category.ClassName of the parent class. A
      plain name is a compile-time error: Specify the full name of the class
      in :INHERIT : categoryname.scriptname!
  - path: classes.inheritance.base_class_qualified_names
    form: value
    value: true
verification:
  basis: observed
  note: >-
    Kept from the classes pack's must-follow item, with its avoid item ("Do
    not write :INHERIT with a plain class name; it is a compile-time error.")
    merged in. The schema lint inherit_qualified_name (word for word) and the
    agent guide say the same. starlims-lsp reports it as
    inherit_qualified_name (from v0.25.0).
---

## Rationale

The parent is found by its full script name. A plain name fails when the class
compiles with `Specify the full name of the class in :INHERIT`.

## Examples

### Good

```ssl
:CLASS Counter;
:INHERIT Samples.BaseCounter;
:DECLARE nCount;

:PROCEDURE Increment;
	Base:Increment();
	Me:nCount += 1;
:ENDPROC;
```

### Bad

```ssl
:CLASS Counter;
:INHERIT BaseCounter;
:DECLARE nCount;

:PROCEDURE Increment;
	Base:Increment();
	Me:nCount += 1;
:ENDPROC;
```
