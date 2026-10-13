---
id: explicit_class_name
title: Name every class
domain: classes
status: active
level: style_only
severity: info
applies_to: [class]
rule: >-
  Give every class an explicit name in `:CLASS`; the name is syntactically
  optional.
categories: [classes]
related_elements: [CLASS]
enforced_by: [reviewer]
schema:
  - path: classes.signature.notes
    form: text
    message: Class name is syntactically optional, but explicit names are preferred for maintained code.
verification:
  basis: convention
  note: >-
    Kept from the agent guide's class definition section ("new and refactored
    code should always provide an explicit class name"). Merged: the schema's
    classes.signature.notes entry, which stays word for word.
---

## Rationale

The name documents which class the file holds, for readers and for tools that
list classes.

## Examples

### Good

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Increment;
	Me:nCount += 1;
:ENDPROC;
```

### Bad

```ssl
:CLASS;
:DECLARE nCount;

:PROCEDURE Increment;
	Me:nCount += 1;
:ENDPROC;
```
