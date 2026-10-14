---
id: consistent_indentation
title: Consistent indentation in a file
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Keep indentation consistent within a file; do not mix tabs and spaces.
categories: [formatting]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the review skill's formatting check ("preserve consistent
    4-space indentation and flag mixed indentation"). Merged: the
    refactoring guide's checklist item "Consistent indentation (tabs or 4
    spaces)" and the agent guide's style guideline "Use consistent
    indentation". The schema allows space indentation, but one style per
    file.
---

## Rationale

Tabs and spaces render at different widths in different editors, so a file
that mixes them shows a block structure that is not the real one.

## Examples

### Good

```ssl
:PROCEDURE Show;
	:DECLARE nCount;

	nCount := 0;

	:RETURN nCount;
:ENDPROC;
```

### Bad

```text
:PROCEDURE Show;
	:DECLARE nCount;
    nCount := 0;
	:RETURN nCount;
:ENDPROC;
```
