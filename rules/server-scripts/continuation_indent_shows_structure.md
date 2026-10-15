---
id: continuation_indent_shows_structure
title: Continuation indent shows the structure
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Indent continuations to reveal expression or argument structure: outside
  brackets, one level past the line that opened the statement; inside a
  bracket, as `bracket_contents_align` says. Do not copy incidental alignment
  columns from another file.
categories: [formatting]
enforced_by: [lsp:fmt.indent_style]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Indent blocks with tabs. Indent
    continuations to reveal expression or argument structure; do not copy
    incidental alignment columns from another file."); its first sentence is
    indent_tabs_preferred. #124 split the bracket case out into
    bracket_contents_align; formatting.continuation_indent (one level) now
    covers only continuations outside brackets (after :=, a leading
    operator, a member chain), which starlims-lsp re-indents.
issues: ["#124"]
---

## Rationale

The indent of a continuation line tells the reader which part of the
expression it belongs to; a column copied from elsewhere tells them nothing.

## Examples

### Good

```ssl
:PROCEDURE Check;
	:PARAMETERS nVal, sName;
	:DECLARE bOk;

	bOk := .F.;

	:IF nVal > 1
		.AND. sName == "x";
		bOk := .T.;
	:ENDIF;

	:RETURN bOk;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Check;
	:PARAMETERS nVal, sName;
	:DECLARE bOk;

	bOk := .F.;

	:IF nVal > 1
                                        .AND. sName == "x";
		bOk := .T.;
	:ENDIF;

	:RETURN bOk;
:ENDPROC;
```
