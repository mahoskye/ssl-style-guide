---
id: ssl_max_line_length
title: SSL lines of about 90 characters
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Keep SSL lines to about 90 characters, breaking longer ones at logical
  points.
categories: [formatting]
enforced_by: [lsp:fmt.max_line_length]
verification:
  basis: convention
  note: >-
    Kept from the agent guide's style guidelines ("Limit line lengths to
    approximately 90 characters, breaking logically"). Merged: the format
    skill's "Target ~90 characters", the refactoring guide's line length
    section and its checklist item. The formatter's 90-column default
    matches.
---

## Rationale

Lines that fit in one view can be read and compared without horizontal
scrolling. SQL inside strings has its own limit in `sql_max_line_length`.

## Examples

### Good

```ssl
:PROCEDURE Describe;
	:PARAMETERS sName, sStatus;
	:DECLARE sOut;

	sOut := sName + " is a fairly long string literal that " + sStatus
		+ " keeps going past the limit";

	:RETURN sOut;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Describe;
	:PARAMETERS sName, sStatus;
	:DECLARE sOut;
	sOut := sName + " is a fairly long string literal that " + sStatus + " keeps going past the limit";
	:RETURN sOut;
:ENDPROC;
```
