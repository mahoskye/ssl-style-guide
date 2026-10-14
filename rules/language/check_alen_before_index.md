---
id: check_alen_before_index
title: Check ALen before indexing dynamic input
domain: language
status: active
level: advisory
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Check `ALen` before reading an index from dynamic input.
categories: [arrays]
machine: { list: must_follow }
related_elements: [ALen]
enforced_by: [reviewer]
verification:
  basis: convention
  note: Kept from the arrays pack, which states it word for word.
---

## Rationale

An index past the end raises. Input from a query or a caller can be shorter
than expected.

## Examples

### Good

```ssl
:PROCEDURE FirstItem;
	:PARAMETERS aItems;

	:IF ALen(aItems) < 1;
		:RETURN NIL;
	:ENDIF;

	:RETURN aItems[1];
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE FirstItem;
	:PARAMETERS aItems;
	:RETURN aItems[1];
:ENDPROC;
```
