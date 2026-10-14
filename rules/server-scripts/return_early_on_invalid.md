---
id: return_early_on_invalid
title: Return early on invalid requests
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Return early for invalid requests and failed contracts.
categories: [control-flow]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's control-flow bullets, which state
    it word for word. Its main orchestration says the same ("Return
    immediately on rejected input").
---

## Rationale

An early return keeps the success path at one indentation level and makes each
rejection visible where it happens.

## Examples

### Good

```ssl
:PROCEDURE CloseOrder;
	:PARAMETERS sOrdNo;

	:IF Empty(sOrdNo);
		:RETURN {.F., {"MISSING_ORDER", "An order number is required."}};
	:ENDIF;

	SQLExecute("UPDATE ordtask SET status = 'Done' WHERE ordno = ?sOrdNo?");

	:RETURN {.T., NIL};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CloseOrder;
	:PARAMETERS sOrdNo;
	:DECLARE aResult;
	:IF !Empty(sOrdNo);
		SQLExecute("UPDATE ordtask SET status = 'Done' WHERE ordno = ?sOrdNo?");
		aResult := {.T., NIL};
	:ELSE;
		aResult := {.F., {"MISSING_ORDER", "An order number is required."}};
	:ENDIF;
	:RETURN aResult;
:ENDPROC;
```
