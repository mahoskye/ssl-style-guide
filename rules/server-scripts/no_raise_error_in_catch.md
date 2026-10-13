---
id: no_raise_error_in_catch
title: Never raise inside :CATCH
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Never call `RaiseError` inside `:CATCH` — the error handler must not become
  the thing that crashes.
categories: [error-handling]
related_elements: [RaiseError, CATCH]
enforced_by: [lsp:diag.raiseerror_in_catch]
schema:
  - path: error_handling.guidance.raise_error_doctrine
    form: text
verification:
  basis: convention
  note: >-
    Kept from the schema's raise_error_doctrine, which states it word for
    word. The agent guide's placement doctrine, the server-script baseline
    and the new-procedure skill say the same.
---

## Rationale

A raise inside `:CATCH` is not caught by that `:TRY`; it escapes to the
caller, so the handler that was meant to contain a failure becomes the source
of one. Return the failure from `:CATCH` instead.

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
		RaiseError("Save failed: " + oErr:Description);
	:ENDTRY;

	:RETURN {.T., NIL};
:ENDPROC;
```
