---
id: me_base_for_method_calls
title: Call class methods through Me and Base
domain: classes
status: active
level: authoritative
severity: error
applies_to: [class]
rule: >-
  Call sibling or inherited methods with `Me:Method()` and `Base:Method()`.
categories: [classes]
machine: { list: must_follow }
related_elements: [me, base]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the classes pack, which states it word for word. The agent
    guide's class method calls section says the same. The prohibition on a
    bare DoProc target is doproc_in_class.
---

## Rationale

A method belongs to an instance. `Me:` calls it on the current instance, and
`Base:` calls the parent class's version.

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

```text
:PROCEDURE Increment;
	Reset();
	Me:nCount += 1;
:ENDPROC;
```
