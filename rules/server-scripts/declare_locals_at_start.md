---
id: declare_locals_at_start
title: Declare locals at the start
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Declare locals at the start of the script or procedure; this is a style
  preference, because `:DECLARE` is valid anywhere a statement is.
categories: [procedures]
related_elements: [DECLARE]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Declare locals at the start of the
    script or procedure"). Merged: the skills' note that :DECLARE before body
    statements is a style preference, and the schema's
    declaration_ordering_note.
---

## Rationale

Declaring every local in one place shows the procedure's state before its
logic. The language does not require it: `:DECLARE` is an ordinary statement,
so a review reports a late declaration as a suggestion, not an error.

## Examples

### Good

```ssl
:PROCEDURE CountRows;
	:PARAMETERS aRows;
	:DECLARE i, nCount;

	nCount := 0;
	:FOR i := 1 :TO ALen(aRows);
		nCount += 1;
	:NEXT;

	:RETURN nCount;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CountRows;
	:PARAMETERS aRows;
	:DECLARE nCount;

	nCount := 0;
	:DECLARE i;
	:FOR i := 1 :TO ALen(aRows);
		nCount += 1;
	:NEXT;

	:RETURN nCount;
:ENDPROC;
```
