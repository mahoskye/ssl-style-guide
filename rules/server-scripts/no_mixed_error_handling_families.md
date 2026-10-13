---
id: no_mixed_error_handling_families
title: Do not mix :ERROR and :TRY in one procedure
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Do not combine legacy `:ERROR`/`:RESUME` handling with `:TRY`/`:CATCH` in
  the same procedure.
categories: [error-handling]
related_elements: [ERROR, RESUME, TRY, CATCH]
enforced_by: [lsp:diag.mixed_error_handling_families]
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline ("External Calls And Error
    Handling"). The schema's error_handling.structure note says the same for
    resume mode.
---

## Rationale

An `:ERROR` handler protects every statement before it, including any `:TRY`
block. In resume mode it takes an error raised inside the `:TRY` body before
`:CATCH` sees it, so `:CATCH` never runs and execution continues inside the
`:TRY` body.

## Examples

### Good

```ssl
:PROCEDURE CountRows;
	:DECLARE nCount;

	:TRY;
		nCount := ALen(ExecFunction("Samples.ListOpen"));
	:CATCH;
		nCount := 0;
		ClearLastSSLError();
	:ENDTRY;

	:RETURN nCount;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CountRows;
	:DECLARE nCount;

	:TRY;
		nCount := ALen(ExecFunction("Samples.ListOpen"));
	:CATCH;
		nCount := 0;
	:ENDTRY;

	:RETURN nCount;
	:ERROR;
		nCount := -1;
	:RESUME;
:ENDPROC;
```
