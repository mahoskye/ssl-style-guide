---
id: comment_section_summaries
title: Major sections open with a short summary
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Begin major sections (procedures, classes, regions) with a short summary.
categories: [formatting]
enforced_by: [reviewer]
schema:
  - path: comments.rules
    form: rule_text
verification:
  basis: convention
  note: Kept from the schema's comments.rules entry, which states it word for word.
---

## Rationale

A one-line summary at the top of a procedure, class or region lets a reader
decide whether to read the section without reading all of it.

## Examples

### Good

```ssl
/* region Totals;
/* Sum the line amounts for one order;
:PROCEDURE SumLines;
	:PARAMETERS aLines;
	:DECLARE i, nTotal;

	nTotal := 0;

	:FOR i := 1 :TO ALen(aLines);
		nTotal += aLines[i];
	:NEXT;

	:RETURN nTotal;
:ENDPROC;

/* endregion;
```

### Bad

```ssl
/* region Totals;
:PROCEDURE SumLines;
	:PARAMETERS aLines;
	:DECLARE i, nTotal;

	nTotal := 0;
	:FOR i := 1 :TO ALen(aLines);
		nTotal += aLines[i];
	:NEXT;

	:RETURN nTotal;
:ENDPROC;
/* endregion;
```
