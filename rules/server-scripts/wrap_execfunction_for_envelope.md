---
id: wrap_execfunction_for_envelope
title: Wrap ExecFunction when you promise a failure envelope
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  When the current boundary promises a stable failure envelope, wrap
  `ExecFunction` in `:TRY`/`:CATCH` unless the deployed function has a
  documented no-throw contract, and validate the returned envelope even when
  the call is wrapped.
categories: [error-handling]
related_elements: [ExecFunction, TRY, CATCH]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("External Calls And Error
    Handling"). Merged: the review skill's "Flag missing :TRY around external
    calls" and the refactor skill's "Wrap external calls in :TRY blocks where
    appropriate".
---

## Rationale

A deployed script can fail by raising, by returning a failure envelope, or
both. A boundary that promises callers an envelope has to catch the raise and
still check what a successful call returned.

## Examples

### Good

```ssl
:PROCEDURE ChangeStatus;
	:PARAMETERS sSampleId, sStatus;
	:DECLARE aResult;

	:TRY;
		aResult := ExecFunction("Samples.WriteStatus", {sSampleId, sStatus});
	:CATCH;
		ClearLastSSLError();
		:RETURN {.F., {"STATUS_NOT_SAVED", "The status change was not saved."}};
	:ENDTRY;

	:IF LimsTypeEx(aResult) != "ARRAY" .OR. ALen(aResult) < 1;
		:RETURN {.F., {"STATUS_CONTRACT", "Invalid status result."}};
	:ENDIF;

	:RETURN aResult;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ChangeStatus;
	:PARAMETERS sSampleId, sStatus;
	:DECLARE aResult;

	aResult := ExecFunction("Samples.WriteStatus", {sSampleId, sStatus});

	:RETURN aResult;
:ENDPROC;
```
