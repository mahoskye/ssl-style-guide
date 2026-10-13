---
id: every_raise_has_handler_boundary
title: Every raise has a handler up the call stack
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Every raise needs a `:TRY`/`:CATCH` (or legacy `:ERROR`/`:RESUME`) boundary
  somewhere up the call stack; an uncaught error fails the invocation and
  surfaces to the end user as a server error.
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
    word. The agent guide and the new-procedure skill ("never where nothing
    catches it") say the same.
---

## Rationale

An error that no caller catches ends the whole invocation, and the end user
sees a server error instead of the failure the script was meant to report.
The entry point a caller reaches is where errors are turned into a result.

## Examples

### Good

```ssl
:PROCEDURE Main;
	:PARAMETERS sSampleId;

	:TRY;
		DoProc("RequireSample", {sSampleId});
	:CATCH;
		ClearLastSSLError();
		:RETURN {.F., {"SAMPLE_REQUIRED", "A sample is required."}};
	:ENDTRY;

	:RETURN {.T., NIL};
:ENDPROC;

/*@private;
:PROCEDURE RequireSample;
	:PARAMETERS sSampleId;

	:IF Empty(sSampleId);
		RaiseError("A sample is required");
	:ENDIF;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Main;
	:PARAMETERS sSampleId;

	DoProc("RequireSample", {sSampleId});

	:RETURN {.T., NIL};
:ENDPROC;

:PROCEDURE RequireSample;
	:PARAMETERS sSampleId;

	:IF Empty(sSampleId);
		RaiseError("A sample is required");
	:ENDIF;
:ENDPROC;
```
