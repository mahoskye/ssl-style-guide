---
id: continuation_line_breaks
title: Where to break a long statement
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Break a multi-line function call after a comma and a multi-line condition
  before `.AND.` or `.OR.`, and indent each continuation line one level.
categories: [formatting]
enforced_by: [reviewer]
schema:
  - path: formatting.continuation_indent
    form: value
    value: 1
verification:
  basis: convention
  note: >-
    Kept from the format skill's line-length items ("Break multi-line
    function calls after commas, indent continuation" and "Break multi-line
    conditions before .AND. / .OR., indent continuation"). Merged: the
    refactoring guide's "At logical points (after commas, before operators)"
    and its examples. The schema's formatting.continuation_indent is one
    level. The formatter keeps these layouts.
---

## Rationale

A line that ends after a comma, or starts with `.AND.`, tells the reader the
statement continues, and one level of continuation indent keeps it apart from
the next statement.

## Examples

### Good

```ssl
:PROCEDURE Check;
	:PARAMETERS nVal, sName;
	:DECLARE bOk;

	bOk := .F.;

	:IF nVal > 1
		.AND. nVal < 5
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
	:IF nVal > 1 .AND.
nVal < 5 .AND.
sName == "x";
		bOk := .T.;
	:ENDIF;
	:RETURN bOk;
:ENDPROC;
```
