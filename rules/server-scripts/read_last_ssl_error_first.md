---
id: read_last_ssl_error_first
title: Read the error before changing the error state
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  In a `:CATCH` that keeps or logs diagnostics, read `GetLastSSLError()`
  before anything changes the SSL error state.
categories: [error-handling]
related_elements: [GetLastSSLError, CATCH]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From the server-script baseline's catch steps (step 1, "Read
    GetLastSSLError() before changing the SSL error state"). The review
    rubric lists a :CATCH that clears an error it did not read as a warning.
---

## Rationale

A call that clears or replaces the last error, including another call that
fails, leaves `GetLastSSLError()` describing something else. Capture the
error object first, then log, translate or clear it.

## Examples

### Good

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle, oErr;

	:TRY;
		sTitle := ReadText("settings/title.txt");
	:CATCH;
		oErr := GetLastSSLError();
		ClearLastSSLError();
		ErrorMes("[ERROR] ReadTitle", Left(oErr:Description, 2000));
		sTitle := "";
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle, oErr;

	:TRY;
		sTitle := ReadText("settings/title.txt");
	:CATCH;
		ClearLastSSLError();
		oErr := GetLastSSLError();
		ErrorMes("[ERROR] ReadTitle", Left(oErr:Description, 2000));
		sTitle := "";
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```
