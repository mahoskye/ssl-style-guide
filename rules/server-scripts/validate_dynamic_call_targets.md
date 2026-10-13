---
id: validate_dynamic_call_targets
title: Validate untrusted code and procedure names
domain: server-scripts
status: active
level: advisory
severity: warning
applies_to: [server_script, class]
rule: >-
  Do not execute code or procedure names derived from untrusted input
  without validation.
categories: [security]
machine: { list: avoid }
related_elements: [ExecFunction, DoProc, ExecUdf]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the security pack's avoid list, which states it word for word.
    Merged: the review skill's security check "Unvalidated user input passed
    to DB functions or ExecFunction" (its database half is
    prevent_sql_injection).
---

## Rationale

`ExecFunction`, `DoProc` and `ExecUdf` run whatever name or code they are
given, so an unchecked value from a caller decides what runs.

## Examples

### Good

```ssl
:PROCEDURE RunReport;
	:PARAMETERS sReport;
	:DECLARE vResult;
	vResult := NIL;
	:IF AScanExact({"Daily", "Weekly"}, sReport) > 0;
		vResult := ExecFunction("Reports." + sReport);
	:ENDIF;
	:RETURN vResult;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE RunReport;
	:PARAMETERS sReport;
	:RETURN ExecFunction("Reports." + sReport);
:ENDPROC;
```
