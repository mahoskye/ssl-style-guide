---
id: error_handler_last_section
title: ":ERROR is the last section and has a body"
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  A legacy `:ERROR` handler is the last section of a procedure: it protects
  the statements before it, and its handler body needs at least one
  statement.
categories: [error-handling]
related_elements: [ERROR, RESUME]
enforced_by: [lsp:diag.error_handler_structure]
verification:
  basis: reference
  note: >-
    Kept from the schema's error_handling.structure note (":ERROR starts the
    last section of a procedure, runs to :ENDPROC, and protects the
    statements before it; the handler body after it must contain at least
    one statement. A handler placed first protects nothing.") and the agent
    guide's Error/Resume section.
---

## Rationale

`:ERROR` runs to `:ENDPROC` and protects only what precedes it, so a handler
placed first protects nothing. An empty handler silently swallows every error
in the procedure.

## Examples

### Good

```text
:PROCEDURE ReadTitle;
	:DECLARE sTitle;

	sTitle := ReadText("settings/title.txt");

	:RETURN sTitle;
	:ERROR;
		sTitle := "";
	:RESUME;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle;

	sTitle := ReadText("settings/title.txt");

	:RETURN sTitle;
	:ERROR;
	:RESUME;
:ENDPROC;
```

## Notes

The good example is a `text` fence because any `:ERROR` handler draws a
`deprecated_keyword` warning: new code uses `:TRY` (see
`prefer_try_over_error_resume`). This rule is for code that keeps a legacy
handler.
