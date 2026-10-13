---
id: try_requires_handler
title: ":TRY needs :CATCH or :FINALLY"
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  `:TRY` requires at least one of `:CATCH` or `:FINALLY`; a bare
  `:TRY ... :ENDTRY` is invalid.
categories: [error-handling]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [TRY, CATCH, FINALLY, ENDTRY]
enforced_by: [lsp:diag.try_requires_handler]
verification:
  basis: reference
  note: >-
    Merged: the error-handling pack's ":TRY requires at least one of :CATCH
    or :FINALLY." (kept) and its avoid item "Do not write bare :TRY ...
    :ENDTRY blocks.", the second half of the foundation bullet, the schema's
    error_handling.structure comment, and the skills' rule lists.
---

## Rationale

The valid forms are `:TRY ... :CATCH ... :ENDTRY`,
`:TRY ... :FINALLY ... :ENDTRY` and `:TRY ... :CATCH ... :FINALLY ... :ENDTRY`.
A `:TRY` block with neither handler is rejected.

## Examples

### Good

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle;

	:TRY;
		sTitle := ReadText("settings/title.txt");
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
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```
