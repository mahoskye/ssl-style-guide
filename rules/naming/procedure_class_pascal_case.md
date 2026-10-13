---
id: procedure_class_pascal_case
title: Procedures and classes are PascalCase
domain: naming
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Procedures and classes use PascalCase.
categories: [naming]
machine: { list: must_follow }
related_elements: [PROCEDURE, CLASS]
enforced_by: [reviewer]
schema:
  - path: naming.procedures
    form: value
    value: PascalCase
  - path: naming.classes
    form: value
    value: PascalCase
verification:
  basis: convention
  note: >-
    Kept from the naming pack, which states it word for word. Merged: the
    review skill's "Class names should be PascalCase" and "Procedure names
    should be PascalCase", the scaffolding skills, the refactoring guide and
    the schema's naming.procedures and naming.classes.
---

## Rationale

PascalCase separates procedure and class names from prefixed variables at a
glance.

## Examples

### Good

```ssl
:PROCEDURE CalculateTotal;
	:RETURN 1;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE calculate_total;
	:RETURN 1;
:ENDPROC;
```
