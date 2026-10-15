---
id: procedure_length_review
title: A long procedure is a prompt to check its responsibilities
domain: language
status: active
level: advisory
severity: info
applies_to: [server_script, class]
rule: >-
  Treat a procedure or class method with more than 80 code lines (blank and
  comment lines excluded) as a prompt to check whether it has more than one
  responsibility, and extract procedures if it does; the number is a review
  trigger, not a limit.
categories: [procedures]
related_elements: [PROCEDURE, DoProc]
enforced_by: [lsp:diag.procedure_length_review]
schema:
  - path: lints.style_rules.procedure_length_review
    form: value
    value: 80
verification:
  basis: observed
  note: >-
    Confirmed on STARLIMS 12: the threshold sits at the 95th percentile of
    procedure length in STARLIMS 12's own base layer (about 83 code lines;
    the 75th percentile is 32, the 90th 57 and the 99th 162), and class
    methods run shorter (95th percentile 61). The trigger restates the server-script style
    guide's "line count and procedure count are review triggers, not
    acceptance limits" with a number. starlims-lsp v0.27.0 reports a
    procedure or class method past the trigger as procedure_length_review
    (info, setting ssl.diagnostics.maxProcedureCodeLines, default 80),
    counting code lines the same way; it is hidden unless info diagnostics
    are shown. Whether the procedure has more than one responsibility stays
    a reviewer's judgment. The examples stay text, since a fence long enough
    to draw the diagnostic would bury the point.
---

## Rationale

Most procedures are short. In STARLIMS 12's own base layer three procedures in
four have at most 32 code lines, and the 95th percentile is about 83, so a
procedure past 80 code lines is among the longest one in twenty of the
product's own procedures. Class methods run shorter still (95th percentile 61). Length alone is not a
defect, but a long procedure often does several things, such as validating
input, reading data, applying a policy and writing a result, and each of those
is easier to read, test and change as its own procedure (refactoring guide,
§6.1 Extract Procedure).

## Exceptions

A procedure that does one thing at length, such as a single long SQL statement
or a linear sequence of steps that only make sense together, stays as it is.
Never split a procedure only to get under the number, and never collapse
distinct responsibilities or remove demonstrated guards to shorten it.

## Examples

### Good

```text
:PROCEDURE ReleaseOrder;    /* 25 code lines: orchestrates and delegates;
	:PARAMETERS sOrderNo;
	...
	oResult := DoProc("ValidateRelease", {sOrderNo});
	...
	oResult := DoProc("WriteRelease", {sOrderNo});
	...
:ENDPROC;

:PROCEDURE ValidateRelease;    /* 40 code lines: one responsibility;
	...
:ENDPROC;
```

### Bad

```text
:PROCEDURE ReleaseOrder;
	/* 160 code lines that validate the order, read its samples, apply the
	   release policy, write the release and log the result, all inline;
	...
:ENDPROC;
```
