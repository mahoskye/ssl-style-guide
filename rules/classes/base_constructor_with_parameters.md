---
id: base_constructor_with_parameters
title: Call a parent Constructor that takes parameters
domain: classes
status: active
level: authoritative
severity: error
applies_to: [class]
rule: >-
  With `:INHERIT`, the parent's parameterless `Constructor` runs automatically
  first; a parent `Constructor` that takes parameters runs only if the derived
  `Constructor` calls `Base:Constructor(args)`.
categories: [classes]
related_elements: [INHERIT, constructor, base]
enforced_by: [reviewer]
verification:
  basis: observed
  note: >-
    Kept from the new-class skill, which states it word for word. The agent
    guide's class definition section says the same.
---

## Rationale

A parent constructor that needs arguments cannot be called for you. Without
the explicit call, the parent's fields keep their declared empty values.

## Examples

### Good

```ssl
:CLASS Counter;
:INHERIT Samples.BaseCounter;
:DECLARE nCount;

:PROCEDURE Constructor;
	:PARAMETERS nStart;

	Base:Constructor(nStart);
	Me:nCount := nStart;
:ENDPROC;
```

### Bad

```ssl
:CLASS Counter;
:INHERIT Samples.BaseCounter;
:DECLARE nCount;

:PROCEDURE Constructor;
	:PARAMETERS nStart;
	Me:nCount := nStart;
:ENDPROC;
```

The parent's `Constructor` takes `nStart` and never runs.
