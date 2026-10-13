---
id: single_catch_per_try
title: One :CATCH per :TRY
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Only one `:CATCH` block is allowed per `:TRY`; there is no multi-catch.
categories: [error-handling]
related_elements: [TRY, CATCH]
enforced_by: [lsp:diag.single_catch]
verification:
  basis: reference
  note: >-
    Kept from the schema's error_handling.structure comment and the agent
    guide ("Only one :CATCH block is allowed per :TRY"). The skills' rule
    lists say the same.
---

## Rationale

`:CATCH` does not name an exception type, so there is nothing to choose
between two handlers. Branch inside the one `:CATCH` on what
`GetLastSSLError()` returns.

## Examples

### Good

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle, oErr;

	:TRY;
		sTitle := ReadText("settings/title.txt");
	:CATCH;
		oErr := GetLastSSLError();
		ErrorMes("[ERROR] ReadTitle", oErr:Description);
		ClearLastSSLError();
		sTitle := "";
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle;

	:TRY;
		sTitle := ReadText("settings/title.txt");
	:CATCH;
		sTitle := "";
	:CATCH;
		sTitle := "Untitled";
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```
