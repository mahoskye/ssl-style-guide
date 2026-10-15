---
id: raise_error_inside_handling_try
title: Raise inside the :TRY that handles it
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Place `RaiseError` directly inside the `:TRY` block whose `:CATCH` handles
  it, so the raise can never escape.
categories: [error-handling]
related_elements: [RaiseError, TRY, CATCH]
enforced_by: [reviewer]
schema:
  - path: error_handling.guidance.raise_error_doctrine
    form: text
verification:
  basis: convention
  note: >-
    Kept from the schema's raise_error_doctrine, which states it word for
    word. The agent guide's placement doctrine, the server-script baseline
    ("External Calls And Error Handling") and the new-procedure skill say the
    same.
---

## Rationale

`RaiseError` does not return. Inside `:TRY` it skips the rest of the
protected statements and hands control to `:CATCH`; execution then continues
after `:ENDTRY`. Raised anywhere else, the error travels up the call stack
until something catches it.

## Exceptions

A raise-only helper marked `/*@private;` raises outside any `:TRY`; its
caller's `:TRY` is the handling block (see `private_raise_only_helpers`).

## Examples

### Good

```ssl
:PROCEDURE ChangeStatus;
	:PARAMETERS sSampleId, sStatus;

	:TRY;
		:IF Empty(sStatus);
			RaiseError("A status is required");
		:ENDIF;

		ExecFunction("Samples.WriteStatus", {sSampleId, sStatus});
	:CATCH;
		ClearLastSSLError();
		:RETURN {.F., {"STATUS_REQUIRED", "A status is required."}};
	:ENDTRY;

	:RETURN {.T., NIL};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ChangeStatus;
	:PARAMETERS sSampleId, sStatus;

	:IF Empty(sStatus);
		RaiseError("A status is required");
	:ENDIF;

	:TRY;
		ExecFunction("Samples.WriteStatus", {sSampleId, sStatus});
	:CATCH;
		ClearLastSSLError();
		:RETURN {.F., {"STATUS_NOT_SAVED", "The status was not saved."}};
	:ENDTRY;

	:RETURN {.T., NIL};
:ENDPROC;
```
