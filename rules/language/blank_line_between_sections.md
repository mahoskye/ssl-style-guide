---
id: blank_line_between_sections
title: One blank line between sections and regions
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Put one blank line between logical sections and between regions: after the
  declarations, before a control block that follows code and after its closer
  when more code follows, before a section comment that follows code, and
  before a procedure's final `:RETURN`; add none at the start or end of a
  body.
categories: [formatting]
enforced_by: [lsp:fmt.blank_lines_between_sections]
schema:
  - path: formatting.blank_lines.before_region
    form: value
    value: 1
  - path: formatting.blank_lines.between_sections
    form: value
    value: 1
verification:
  basis: convention
  note: >-
    Kept from the format skill ("1 blank line between logical sections") and
    the refactoring guide's blank-lines table ("Between logical sections",
    "Between regions"). The schema's formatting.blank_lines.before_region
    says the same. The boundaries were named in #125, and starlims-lsp
    v0.26.0 inserts a blank line at each of them (setting
    ssl.format.blankLinesBetweenSections, on by default) without removing
    an author's blank lines.
issues: ["#125"]
---

## Rationale

A blank line marks where one step of the logic ends and the next begins.
Naming the boundaries makes the layout the same in every file: the
declarations stand apart from the work, each control block reads as one
unit, a section comment opens the code it describes, and the result a
procedure returns is easy to find.

## Exceptions

Consecutive declarations stay together, a comment between two declarations
stays with them, and a comment directly above a block or the final
`:RETURN` takes the blank line above itself instead of being separated from
the code it describes. Blank lines an author added elsewhere are kept.

## Examples

### Good

```ssl
:PROCEDURE Total;
	:PARAMETERS aItems;
	:DECLARE nTotal, i;

	nTotal := 0;

	:FOR i := 1 :TO ALen(aItems);
		nTotal := nTotal + aItems[i];
	:NEXT;

	nTotal := Round(nTotal, 2);

	/* Apply the discount;
	:IF nTotal > 50;
		nTotal := nTotal * 0.9;
	:ENDIF;

	:RETURN nTotal;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Total;
	:PARAMETERS aItems;
	:DECLARE nTotal, i;
	nTotal := 0;
	:FOR i := 1 :TO ALen(aItems);
		nTotal := nTotal + aItems[i];
	:NEXT;
	nTotal := Round(nTotal, 2);
	/* Apply the discount;
	:IF nTotal > 50;
		nTotal := nTotal * 0.9;
	:ENDIF;
	:RETURN nTotal;
:ENDPROC;
```
