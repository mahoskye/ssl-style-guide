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
enforced_by: [reviewer]
schema:
  - path: lints.style_rules.procedure_length_review
    form: value
    value: 80
verification:
  basis: observed
  note: >-
    The threshold is provisional: it sits near the top of the procedure
    lengths measured in a production snapshot (75th percentile about 35 code
    lines, 95th about 100) and will be replaced once a size survey of the v12
    base layer is available. The trigger restates the server-script style
    guide's "line count and procedure count are review triggers, not
    acceptance limits" with a number. No starlims-lsp diagnostic counts
    procedure lines yet, so a reviewer applies it.
---

## Rationale

Most procedures are short. In a production snapshot the 75th percentile of
procedure length was about 35 code lines and the 95th about 100, so a
procedure past 80 code lines is near the top of normal. Length alone is not a
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
