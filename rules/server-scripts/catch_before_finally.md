---
id: catch_before_finally
title: ":CATCH comes before :FINALLY"
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  When a `:TRY` has both handlers, `:CATCH` must precede `:FINALLY`.
categories: [error-handling]
related_elements: [TRY, CATCH, FINALLY]
enforced_by: [lsp:diag.catch_order_before_finally]
verification:
  basis: reference
  note: >-
    Kept from the schema's error_handling.structure comment ("When both
    :CATCH and :FINALLY are present, :CATCH must precede :FINALLY") and the
    agent guide's Error Handling section.
---

## Rationale

The block reads in the order it runs: the protected statements, then the
handler for an error, then the cleanup that always runs.

## Examples

### Good

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle;

	:TRY;
		sTitle := ReadText("settings/title.txt");
	:CATCH;
		sTitle := "";
		ClearLastSSLError();
	:FINALLY;
		UsrMes("Title read attempted");
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
	:FINALLY;
		UsrMes("Title read attempted");
	:CATCH;
		sTitle := "";
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```
