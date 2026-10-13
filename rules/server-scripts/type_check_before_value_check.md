---
id: type_check_before_value_check
title: Check the type before the value
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Separate runtime-type validation from value validation when `Len`,
  `Round`, array indexing or property access requires a specific type, and
  reject an invalid shape before evaluating the corresponding content
  predicate.
categories: [types]
related_elements: [LimsTypeEx]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Validation And Boundary
    Contracts"), which states it in two sentences, joined here.
---

## Rationale

A content check such as `Len(v) > 0` raises when `v` has the wrong type, so
the type check has to come first.

## Examples

### Good

```ssl
:PROCEDURE HasName;
	:PARAMETERS vName;
	:IF LimsTypeEx(vName) != "STRING";
		:RETURN .F.;
	:ENDIF;

	:RETURN Len(vName) > 0;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE HasName;
	:PARAMETERS vName;
	:RETURN Len(vName) > 0;
:ENDPROC;
```
