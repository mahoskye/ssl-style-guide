---
id: no_silent_error_swallowing
title: Do not swallow errors silently
domain: server-scripts
status: active
level: advisory
severity: warning
applies_to: [server_script, class]
rule: >-
  Log errors with contextual identifiers; avoid swallowing errors silently.
categories: [error-handling, logging]
related_elements: [CATCH, ErrorMes]
enforced_by: [reviewer]
schema:
  - path: error_handling.guidance.logging_guidance
    form: text
verification:
  basis: convention
  note: >-
    Kept from the schema's error_handling.guidance.logging_guidance, which
    states it word for word. Merged: the review skill's "Flag empty :CATCH
    blocks (swallowed errors) unless intentional" and the review rubric's "a
    :CATCH that swallows an error" (warning).
---

## Rationale

A `:CATCH` that neither logs, returns a failure, nor records the error hides
it: the operation looks successful to its caller and leaves nothing to
investigate. Include the identifiers that say which record or request failed.

## Exceptions

A boundary that turns the error into a stable failure result, or that
deliberately delegates logging to its caller, has not swallowed it.

## Examples

### Good

```ssl
:PROCEDURE ReadTitle;
	:PARAMETERS sPath;
	:DECLARE sTitle, oErr;

	:TRY;
		sTitle := ReadText(sPath);
	:CATCH;
		oErr := GetLastSSLError();
		ErrorMes("[ERROR] ReadTitle " + sPath, Left(oErr:Description, 2000));
		ClearLastSSLError();
		sTitle := "";
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ReadTitle;
	:PARAMETERS sPath;
	:DECLARE sTitle;

	:TRY;
		sTitle := ReadText(sPath);
	:CATCH;
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```
