---
id: base_member_access
title: Base needs :INHERIT and a member
domain: classes
status: active
level: authoritative
severity: error
applies_to: [class]
rule: >-
  Use `Base` only in a class with `:INHERIT`, and always as
  `Base:MemberName`; it cannot stand alone.
categories: [classes]
related_elements: [base, INHERIT]
enforced_by: [lsp:diag.base_requires_inherit, lsp:diag.base_standalone]
verification:
  basis: reference
  note: >-
    Kept from the agent guide's Base form note ("Reference to the parent class
    in a :CLASS with :INHERIT. Must always be followed by :MemberName — cannot
    stand alone.").
---

## Rationale

`Base` names the parent class's members. A class with no `:INHERIT` has no
parent, and `Base` on its own is not a value.

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
:DECLARE oParent;

:PROCEDURE Increment;
	Base:Increment();
	Me:oParent := Base;
:ENDPROC;
```
