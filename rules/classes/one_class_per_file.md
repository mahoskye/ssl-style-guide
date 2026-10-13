---
id: one_class_per_file
title: One class per file
domain: classes
status: active
level: authoritative
severity: error
applies_to: [class]
rule: >-
  Define only one `:CLASS` per file.
categories: [classes]
related_elements: [CLASS]
enforced_by: [lsp:diag.one_class_per_file]
schema:
  - path: lints.compile_errors.rules.one_class_per_file.message
    form: text
    message: Only one :CLASS definition allowed per file.
verification:
  basis: reference
  note: >-
    Kept from the schema's compile_errors entry one_class_per_file, whose
    message stays word for word. The new-class skill's "One class per file"
    says the same.
---

## Rationale

A class runs from `:CLASS` to the end of the file, so a second `:CLASS` cannot
start inside it.

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
:CLASS Counter;
:DECLARE nCount;

:CLASS Other;
:DECLARE nOther;
```
