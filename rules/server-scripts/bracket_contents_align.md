---
id: bracket_contents_align
title: Continuation lines inside brackets align with the first item
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Inside an unclosed `(`, `{` or `[` whose first item shares the bracket's
  line, align each continuation line with that first item (the opening line's
  indentation, then spaces); a bracket that ends its line hangs, with its
  items one level in and a leading closing delimiter back at the opening
  line's indentation; when an item would not fit at the aligned column, break
  right after the bracket and hang its items.
categories: [formatting]
enforced_by: [lsp:fmt.indent_style]
verification:
  basis: convention
  note: >-
    Decided in #124, on the same principle as wrapped_list_alignment.
    starlims-lsp v0.26.0 applies it to whole documents and selections, and
    its line wrapper hangs a bracket only when an item would not fit at the
    aligned column (or when the first item sits past half the line limit).
    Continuations outside brackets keep the one-level indent of
    formatting.continuation_indent.
issues: ["#124"]
---

## Rationale

Aligned items show which bracket they belong to, so a reader sees the
argument or element structure without counting delimiters. A bracket that
ends its line has no first item to align with, so its items hang one level
in and the closing delimiter lines up with the line that opened it. The
alignment is the line's own indent followed by spaces, so it holds at any
tab width.

## Examples

### Good

```ssl
:PROCEDURE BuildRow;
	:PARAMETERS sSampleNo, sMatrix, sSite, dTaken, sRemarks;
	:DECLARE aStatusCodes, nFirstQuarterRevenue, nSecondQuarterRevenue,
	         nThirdQuarterRevenue;

	aStatusCodes := {
		"Logged", "Received", "In Progress",
		"Complete"
	};
	nFirstQuarterRevenue := 100;
	nSecondQuarterRevenue := 200;
	nThirdQuarterRevenue := 300;
	DoProc("CalculateTotals", {nFirstQuarterRevenue, nSecondQuarterRevenue,
	                           nThirdQuarterRevenue});

	:RETURN {sSampleNo, sMatrix, sSite, dTaken, aStatusCodes,
	         sRemarks};
:ENDPROC;

:PROCEDURE CalculateTotals;
	:PARAMETERS nFirst, nSecond, nThird;

	:RETURN nFirst + nSecond + nThird;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE BuildRow;
	:PARAMETERS sSampleNo, sMatrix, sSite, dTaken, sRemarks;
	:DECLARE aStatusCodes, nFirstQuarterRevenue, nSecondQuarterRevenue,
	         nThirdQuarterRevenue;

	aStatusCodes := {
	"Logged", "Received", "In Progress",
	"Complete"
		};
	nFirstQuarterRevenue := 100;
	nSecondQuarterRevenue := 200;
	nThirdQuarterRevenue := 300;
	DoProc("CalculateTotals", {nFirstQuarterRevenue, nSecondQuarterRevenue,
		nThirdQuarterRevenue});

	:RETURN {sSampleNo, sMatrix, sSite, dTaken, aStatusCodes,
		sRemarks};
:ENDPROC;

:PROCEDURE CalculateTotals;
	:PARAMETERS nFirst, nSecond, nThird;

	:RETURN nFirst + nSecond + nThird;
:ENDPROC;
```
