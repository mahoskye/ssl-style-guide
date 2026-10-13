---
id: prefer_try_over_error_resume
title: Prefer :TRY over legacy :ERROR/:RESUME
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Prefer `:TRY`/`:CATCH`/`:FINALLY` over legacy `:ERROR`/`:RESUME`.
categories: [error-handling]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [TRY, CATCH, FINALLY, ERROR, RESUME]
enforced_by: [lsp:diag.deprecated_keyword]
schema:
  - path: error_handling.guidance.prefer_structured
    form: value
    value: true
  - path: lints.deprecated_keywords.:ERROR.message
    form: text
    message: ":ERROR is legacy error handling. Prefer :TRY/:CATCH/:FINALLY in new and refactored code."
  - path: lints.deprecated_keywords.:RESUME.message
    form: text
    message: ":RESUME is legacy error handling. Prefer :TRY/:CATCH/:FINALLY in new and refactored code."
verification:
  basis: convention
  note: >-
    Kept from the error-handling pack, which states it word for word. Merged:
    the first half of the foundation bullet, the agent guide's style guidance
    rule 4, and the schema's deprecated_keywords entries for :ERROR and
    :RESUME, which say the same in their messages.
---

## Rationale

`:ERROR`/`:RESUME` handlers still run, but they cover the whole procedure and,
in resume mode, run once for every failing statement. A `:TRY` block covers
only the statements that need it and has a `:FINALLY` for cleanup.

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
	:ENDTRY;

	:RETURN sTitle;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ReadTitle;
	:DECLARE sTitle;

	sTitle := ReadText("settings/title.txt");

	:RETURN sTitle;
	:ERROR;
		sTitle := "";
	:RESUME;
:ENDPROC;
```
