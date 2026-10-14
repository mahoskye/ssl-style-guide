---
id: lsearch_for_single_values
title: LSearch for single-value lookups
domain: sql
status: active
level: advisory
severity: info
applies_to: [server_script, class]
rule: >-
  Use `LSearch` for single-value lookups, with explicit parameters.
categories: [database]
related_elements: [LSearch]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the agent guide's SQL guidance #6. Its database function
    comparison lists LSearch as the single-value function.
---

## Rationale

`LSearch` returns the first column of the first row directly, so a lookup
needs no result array to unpack.

## Examples

### Good

```ssl
:PROCEDURE OrderStatus;
	:PARAMETERS sOrdNo;
	:DECLARE sStatus;

	sStatus := LSearch("SELECT status FROM ordtask WHERE ordno = ?",,, {sOrdNo});

	:RETURN sStatus;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE OrderStatus;
	:PARAMETERS sOrdNo;
	:DECLARE aRows;
	aRows := SQLExecute("SELECT status FROM ordtask WHERE ordno = ?sOrdNo?");
	:RETURN aRows[1][1];
:ENDPROC;
```
