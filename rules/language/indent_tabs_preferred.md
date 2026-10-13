---
id: indent_tabs_preferred
title: Tabs for indentation
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Prefer tabs for indentation; if the file already uses spaces, preserve
  4-space indentation.
categories: [formatting]
machine: { list: must_follow }
enforced_by: [lsp:fmt.indent_style]
schema:
  - path: formatting.indent_style
    form: value
    value: tabs_preferred
verification:
  basis: convention
  note: >-
    Kept from the review and refactor skills. Merged: the formatting pack's
    avoid item "Do not normalize indentation globally; preserve 4-space files
    and prefer tabs otherwise.", the other skills' variants, the agent guide's
    style guidelines and the schema's formatting.indent_style.
---

## Rationale

Tabs are the house style and what the formatter emits. Converting an existing
space-indented file wholesale buries the real change in an unreadable diff.

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

```ssl
:PROCEDURE Show;
  :DECLARE nCount;
  nCount := 0;
  :RETURN nCount;
:ENDPROC;
```
