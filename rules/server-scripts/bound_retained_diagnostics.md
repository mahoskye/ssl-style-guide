---
id: bound_retained_diagnostics
title: Bound retained diagnostic text
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Bound diagnostic text that a `:CATCH` keeps or logs, normally with
  `Left(..., 2000)`.
categories: [error-handling, logging]
related_elements: [Left, GetLastSSLError]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From the server-script baseline's catch steps (step 2, "Bound retained
    diagnostic text, normally with Left(..., 2000)") and its worked example.
---

## Rationale

Full error descriptions can include stack details and nested causes and grow
without limit. A bounded copy keeps logs and result fields a predictable
size.

## Examples

### Good

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle, oErr;

	:TRY;
		sTitle := ReadText("settings/title.txt");
	:CATCH;
		oErr := GetLastSSLError();
		ErrorMes("[ERROR] ReadTitle", Left(oErr:FullDescription, 2000));
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
		ErrorMes("[ERROR] ReadTitle", oErr:FullDescriptionEx);
		ClearLastSSLError();
		sTitle := "";
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```
