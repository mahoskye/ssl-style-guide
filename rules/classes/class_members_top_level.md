---
id: class_members_top_level
title: Class members stay at the top indentation level
domain: classes
status: active
level: style_only
severity: info
applies_to: [class]
rule: >-
  Do not indent the class body because of `:CLASS`; class members stay at the
  file's top indentation level.
categories: [classes]
related_elements: [CLASS]
enforced_by: [lsp:fmt.indent_style]
schema:
  - path: classes.signature.indentation
    form: value
    value: top_level
verification:
  basis: convention
  note: >-
    Kept from the format skill's indentation list. Merged: the schema's
    classes.signature.indentation.
---

## Rationale

`:CLASS` opens no block; the class simply runs to the end of the file. The
formatter keeps members at the top level.

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

	:PROCEDURE Increment;
		Me:nCount += 1;
	:ENDPROC;
```
