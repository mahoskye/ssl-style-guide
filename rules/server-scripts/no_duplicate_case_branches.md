---
id: no_duplicate_case_branches
title: No duplicate outcome branches
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Do not duplicate identical outcome branches; keep separate branches only
  when their behavior differs.
categories: [control-flow]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's control-flow bullets, which state
    it word for word.
---

## Rationale

Two branches with the same body make a reader look for a difference that is
not there, and the copies drift apart over time.

## Examples

### Good

```ssl
:PROCEDURE IsFinal;
	:PARAMETERS sStatus;
	:RETURN AScanExact({"Done", "Cancelled"}, sStatus) > 0;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE IsFinal;
	:PARAMETERS sStatus;
	:DECLARE bFinal;
	:BEGINCASE;
	:CASE sStatus == "Done";
		bFinal := .T.;
		:EXITCASE;
	:CASE sStatus == "Cancelled";
		bFinal := .T.;
		:EXITCASE;
	:OTHERWISE;
		bFinal := .F.;
		:EXITCASE;
	:ENDCASE;
	:RETURN bFinal;
:ENDPROC;
```
