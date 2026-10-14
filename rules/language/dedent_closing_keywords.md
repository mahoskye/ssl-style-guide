---
id: dedent_closing_keywords
title: Closing keywords dedent to their block
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Dedent a closing keyword to the level of the keyword that opened its
  block: `:ENDIF`, `:ENDWHILE`, `:NEXT`, `:ENDCASE`, `:ENDTRY`, `:ENDPROC`,
  `:ENDREGION` and `:ENDINLINECODE`.
categories: [formatting]
enforced_by: [lsp:fmt.indent_style]
verification:
  basis: convention
  note: >-
    Kept from the refactoring guide's list of keywords that close an
    indented body ("dedent before the keyword"). Merged: the format skill's
    "Dedent closing keywords". Matches formatter output at LSP v0.24.0.
---

## Rationale

A closing keyword at the level of its opening keyword marks where the block
ends, so a reader can match the pair by eye.

## Examples

### Good

```ssl
:PROCEDURE CountDown;
	:PARAMETERS nCount;

	:WHILE nCount > 0;
		nCount := nCount - 1;
	:ENDWHILE;

	:RETURN nCount;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CountDown;
	:PARAMETERS nCount;
	:WHILE nCount > 0;
		nCount := nCount - 1;
		:ENDWHILE;
	:RETURN nCount;
:ENDPROC;
```
