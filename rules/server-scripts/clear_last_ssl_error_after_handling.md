---
id: clear_last_ssl_error_after_handling
title: Clear the error state after handling it
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Call `ClearLastSSLError()` after handling an error in `:CATCH`, so stale
  error state does not leak into later handling.
categories: [error-handling]
related_elements: [ClearLastSSLError, GetLastSSLError, CATCH]
enforced_by: [reviewer]
schema:
  - path: error_handling.guidance.raise_error_doctrine
    form: text
verification:
  basis: convention
  note: >-
    Kept from the schema's raise_error_doctrine, which states it word for
    word. Merged: the server-script baseline's catch steps ("Call
    ClearLastSSLError() only after the error has actually been read or
    handled", and an envelope-only catch "still calls ClearLastSSLError()"),
    the agent guide, and the new-procedure skill.
---

## Rationale

The last error stays set after `:CATCH` finishes. Code that checks it later
would see the old failure as if it were new. Clear it once the handler has
read or dealt with it, never before.

## Examples

### Good

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle, oErr;

	:TRY;
		sTitle := ReadText("settings/title.txt");
	:CATCH;
		oErr := GetLastSSLError();
		ErrorMes("[ERROR] ReadTitle", Left(oErr:Description, 2000));
		ClearLastSSLError();
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
		oErr := GetLastSSLError();
		ErrorMes("[ERROR] ReadTitle", Left(oErr:Description, 2000));
		sTitle := "";
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```
