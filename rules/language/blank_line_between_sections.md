---
id: blank_line_between_sections
title: One blank line between sections and regions
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Put one blank line between logical sections and between regions.
categories: [formatting]
enforced_by: [reviewer]
schema:
  - path: formatting.blank_lines.before_region
    form: value
    value: 1
verification:
  basis: convention
  note: >-
    Kept from the format skill ("1 blank line between logical sections") and
    the refactoring guide's blank-lines table ("Between logical sections",
    "Between regions"). The schema's formatting.blank_lines.before_region
    says the same.
---

## Rationale

A blank line marks where one step of the logic ends and the next begins.

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
	:RETURN nTotal;
:ENDPROC;
```
