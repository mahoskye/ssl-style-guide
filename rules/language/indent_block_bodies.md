---
id: indent_block_bodies
title: Indent block bodies one level
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Indent the body of a block one level: `:IF`, `:WHILE`, `:FOR`,
  `:BEGINCASE`, `:TRY`, `:PROCEDURE`, `:REGION` and `:BEGININLINECODE` open
  an indented body, and each nested block adds one more level.
categories: [formatting]
enforced_by: [lsp:fmt.indent_style]
schema:
  - path: formatting.indent_width
    form: value
    value: 1
verification:
  basis: convention
  note: >-
    Kept from the refactoring guide's indentation table ("Block content",
    "Nested blocks") and its list of keywords that open an indented body.
    Merged: the format skill's "Indent one level inside blocks". The
    schema's formatting.indent_width says one indent per nesting level.
    Matches formatter output at LSP v0.24.0.
---

## Rationale

Indentation shows which statements a block controls. One level per block, in
tabs or in the file's existing 4 spaces, is the layout the formatter produces.

## Examples

### Good

```ssl
:PROCEDURE CountDown;
	:PARAMETERS nCount;

	:IF nCount > 0;
		nCount := nCount - 1;
	:ENDIF;

	:RETURN nCount;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CountDown;
:PARAMETERS nCount;
:IF nCount > 0;
nCount := nCount - 1;
:ENDIF;
:RETURN nCount;
:ENDPROC;
```
