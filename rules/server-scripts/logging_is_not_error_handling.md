---
id: logging_is_not_error_handling
title: Logging is not error handling
domain: server-scripts
status: active
level: advisory
severity: warning
applies_to: [server_script, class]
rule: >-
  Do not use logging as error handling when caller-visible behavior depends on
  the result.
categories: [logging]
machine: { list: avoid }
related_elements: [ErrorMes, UsrMes]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the logging pack, which states it word for word. The
    server-script baseline says the same of logs ("Server logs are diagnostic
    evidence, not workflow state").
---

## Rationale

A log entry tells an operator what happened; it tells the caller nothing.
When the caller's next step depends on whether the operation worked, the
failure has to be in the result.

## Examples

### Good

```ssl
:PROCEDURE Save;
	:PARAMETERS sSampleId;
	:DECLARE oErr;

	:TRY;
		ExecFunction("Samples.Write", {sSampleId});
	:CATCH;
		oErr := GetLastSSLError();
		ErrorMes("[ERROR] Save", Left(oErr:Description, 2000));
		ClearLastSSLError();
		:RETURN {.F., {"NOT_SAVED", "The sample was not saved."}};
	:ENDTRY;

	:RETURN {.T., NIL};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Save;
	:PARAMETERS sSampleId;
	:DECLARE oErr;

	:TRY;
		ExecFunction("Samples.Write", {sSampleId});
	:CATCH;
		oErr := GetLastSSLError();
		ErrorMes("[ERROR] Save", Left(oErr:Description, 2000));
		ClearLastSSLError();
	:ENDTRY;

	:RETURN {.T., NIL};
:ENDPROC;
```
