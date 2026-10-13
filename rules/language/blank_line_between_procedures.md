---
id: blank_line_between_procedures
title: One blank line between procedures
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Put one blank line between procedures.
categories: [formatting]
enforced_by: [lsp:fmt.blank_lines_between_procs]
schema:
  - path: formatting.blank_lines.before_procedure
    form: value
    value: 1
verification:
  basis: convention
  note: >-
    Kept from the format skill ("1 blank line between procedures") and the
    refactoring guide's blank-lines table. The schema's
    formatting.blank_lines.before_procedure says the same, and the formatter
    normalizes the gap between procedures to one line.
---

## Rationale

One blank line separates procedures without spreading a file out.

## Examples

### Good

```ssl
:PROCEDURE First;
	:RETURN 1;
:ENDPROC;

:PROCEDURE Second;
	:RETURN 2;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE First;
	:RETURN 1;
:ENDPROC;
:PROCEDURE Second;
	:RETURN 2;
:ENDPROC;
```
