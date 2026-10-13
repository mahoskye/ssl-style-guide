---
id: exitcase_statement_level
title: :EXITCASE indents like a statement
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Indent `:EXITCASE` at the level of the other statements in its branch; it
  does not change the indentation.
categories: [formatting]
enforced_by: [lsp:fmt.indent_style]
verification:
  basis: convention
  note: >-
    Kept from the format skill (":EXITCASE stays at content level") and the
    refactoring guide ("stays at content level, like a break statement").
    Matches formatter output at LSP v0.24.0.
---

## Rationale

`:EXITCASE` is a regular statement of the branch, like a `break`, not a
closing keyword, so it does not dedent.

## Examples

### Good

```ssl
:PROCEDURE Describe;
	:PARAMETERS nCount;
	:DECLARE sText;
	:BEGINCASE;
	:CASE nCount == 0;
		sText := "none";
		:EXITCASE;
	:OTHERWISE;
		sText := "some";
		:EXITCASE;
	:ENDCASE;
	:RETURN sText;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Describe;
	:PARAMETERS nCount;
	:DECLARE sText;
	:BEGINCASE;
	:CASE nCount == 0;
		sText := "none";
	:EXITCASE;
	:OTHERWISE;
		sText := "some";
	:EXITCASE;
	:ENDCASE;
	:RETURN sText;
:ENDPROC;
```
