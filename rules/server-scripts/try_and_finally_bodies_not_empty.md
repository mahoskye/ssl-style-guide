---
id: try_and_finally_bodies_not_empty
title: ":TRY and :FINALLY bodies are not empty"
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  The `:TRY` body requires at least one statement, and so does a `:FINALLY`
  body; a `:CATCH` body may be empty.
categories: [error-handling]
related_elements: [TRY, CATCH, FINALLY]
enforced_by: [lsp:diag.finally_empty]
verification:
  basis: reference
  note: >-
    Kept from the schema's error_handling.structure comments and the agent
    guide's "Body requirements". Merged: the skills' ":TRY body requires at
    least one statement; :FINALLY body (if present) requires at least one
    statement".
---

## Rationale

An empty `:TRY` protects nothing and an empty `:FINALLY` cleans up nothing;
both are rejected. An empty `:CATCH` is valid, though a handler that swallows
the error silently is a review finding of its own.

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

	sTitle := ReadText("settings/title.txt");
	:TRY;
	:FINALLY;
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```

## Notes

starlims-lsp reports an empty `:FINALLY` as `finally_empty` and an empty
`:TRY` body as `try_structure`.
