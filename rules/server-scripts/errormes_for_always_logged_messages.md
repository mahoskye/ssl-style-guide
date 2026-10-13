---
id: errormes_for_always_logged_messages
title: ErrorMes for messages that must always be logged
domain: server-scripts
status: active
level: advisory
severity: info
applies_to: [server_script, class]
rule: >-
  Use `ErrorMes` for messages that must be written even when normal
  user-message logging is disabled.
categories: [logging]
machine: { list: must_follow }
related_elements: [ErrorMes, UsrMes, InfoMes]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the logging pack, which states it word for word.
---

## Rationale

`UsrMes` output depends on the user-message logging setting. A failure that
someone must be able to investigate later is written with `ErrorMes`, which
does not.

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
		UsrMes("[ERROR] ReadTitle", Left(oErr:Description, 2000));
		ClearLastSSLError();
		sTitle := "";
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```
