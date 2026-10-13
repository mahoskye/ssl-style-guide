---
id: visibility_annotations_script_only
title: Access modifiers do nothing on class methods
domain: server-scripts
status: active
level: authoritative
severity: warning
applies_to: [class]
rule: >-
  Do not put `/*@private;` or `/*@protected;` on class methods; they affect
  script procedures only, and class methods are always public.
categories: [procedures, classes]
related_elements: [PROCEDURE, CLASS]
enforced_by: [lsp:diag.visibility_annotation]
schema:
  - path: procedures.visibility_annotations.class_restriction
    form: text
    message: These annotations have no effect on class methods — class methods are always Public|Virtual
verification:
  basis: reference
  note: >-
    Kept from the schema's procedures.visibility_annotations.class_restriction
    and the server-script baseline ("The annotations affect script
    procedures only; they are inert on class methods"). The new-procedure
    skill says the same.
---

## Rationale

On a class method the annotation changes nothing, so it tells a reader the
method is private when any caller can reach it.

## Examples

### Good

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Reset;
	Me:nCount := 0;
:ENDPROC;
```

### Bad

```ssl
:CLASS Counter;
:DECLARE nCount;

/*@private;
:PROCEDURE Reset;
	Me:nCount := 0;
:ENDPROC;
```
