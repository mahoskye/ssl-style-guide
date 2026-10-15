---
id: same_level_block_keywords
title: Branch keywords sit at the block level
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Put `:ELSE`, `:CASE`, `:OTHERWISE`, `:CATCH` and `:FINALLY` at the level
  of the keyword that opened their block, then indent the body that follows
  them one level.
categories: [formatting]
enforced_by: [lsp:fmt.indent_style]
verification:
  basis: convention
  note: >-
    Kept from the refactoring guide's same-level keywords ("dedent to parent
    level, then open a new indented body"). Merged: the format skill's
    "Same-level keywords (dedent then re-indent)". Matches formatter output
    at LSP v0.24.0, which also puts `:CASE` at the level of `:BEGINCASE`.
---

## Rationale

These keywords end one branch of a block and start the next, so they line up
with the keyword that opened the block and their bodies are indented like any
other block body.

## Examples

### Good

```ssl
:PROCEDURE Describe;
	:PARAMETERS nCount;
	:DECLARE sText;

	:IF nCount > 0;
		sText := "some";
	:ELSE;
		sText := "none";
	:ENDIF;

	:RETURN sText;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Describe;
	:PARAMETERS nCount;
	:DECLARE sText;
	:IF nCount > 0;
		sText := "some";
		:ELSE;
		sText := "none";
	:ENDIF;
	:RETURN sText;
:ENDPROC;
```
