---
id: no_raw_diagnostics_in_caller_failures
title: Caller-safe failures carry a code and a sanitized message
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Never return raw SSL diagnostics, exception descriptions, credentials, or
  payload bodies through caller-safe failures; return a stable code and a
  sanitized message.
categories: [error-handling, security]
related_elements: [GetLastSSLError]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's boundary rules. Merged: its catch
    step 4 ("Return a stable code and sanitized message") and its completion
    check ("Caller-safe failures contain stable codes and sanitized
    messages").
---

## Rationale

Error descriptions can contain SQL text, file paths, connection details and
record contents. A caller needs a code it can branch on and a message it can
show; the diagnostic belongs in the server log.

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
		ClearLastSSLError();
		:RETURN {.F., {"NOT_SAVED", oErr:FullDescription}};
	:ENDTRY;

	:RETURN {.T., NIL};
:ENDPROC;
```
