---
id: script_size_review
title: A large server script is a prompt to check its responsibilities
domain: language
status: active
level: advisory
severity: info
applies_to: [server_script]
rule: >-
  Aim for server scripts of up to about 200 code lines with at most one local
  procedure; treat a server script with more than 400 code lines or more than 12 local
  procedures as a prompt to check its responsibilities: organize it into
  responsibility-based regions first, and move a responsibility to a separate
  script only when it is reusable on its own or independently owned.
categories: [module-structure]
related_elements: [REGION, DoProc, ExecFunction]
enforced_by: [reviewer]
schema:
  - path: lints.style_rules.script_size_review
    form: value
    value:
      max_code_lines: 400
      max_local_procedures: 12
      ideal_code_lines: 200
      ideal_local_procedures: 1
verification:
  basis: observed
  note: >-
    Confirmed on STARLIMS 12. The ideal is the shape of STARLIMS 12's own
    base layer: its script sizes are median 21 code lines, 75th percentile
    54, 90th 129, 95th 198 and 99th 551; local procedures per script are 90th
    percentile 2, 95th 5 and 99th 15; and only 1.4% of its scripts have over
    200 code lines with zero or one procedure. The triggers are deliberately
    generous, to leave developers room. The trigger restates the server-script style guide's
    "line count and procedure count are review triggers, not acceptance
    limits" with numbers. No starlims-lsp diagnostic measures script size yet,
    so a reviewer applies it.
---

## Rationale

Most server scripts are small. In STARLIMS 12's own base layer the median
script has 21 code lines, the 95th percentile about 200, and most scripts have
no local procedures at all; the few large scripts are nearly always broken
into procedures. That shape, up to about 200 code lines with zero or one local
procedure, is the one to aim for. Code written on top of the product tends to
run larger, so the review trigger is deliberately generous: a script past 400
code lines or 12 local procedures is well beyond the product's own top of
normal and likely holds more than one responsibility. Regions that group related
procedures by responsibility make such a script navigable without changing how
it runs. Moving a responsibility to its own script has a cost: a call through
`ExecFunction` resolves its string target at run time and crosses into a
separate deployment unit, where a local `DoProc` stays inside the file. Pay
that cost only for a responsibility that is reusable on its own or owned
independently.

## Exceptions

The 200-line, one-procedure shape is a target, and the 400-line,
12-procedure numbers are review triggers; neither is a limit. Never split a script only to get
under them, and never collapse distinct responsibilities or remove
demonstrated guards to shorten it.

## Examples

### Good

```text
/* 520 code lines, 15 local procedures, grouped by responsibility;
:REGION Main;
	...
:ENDREGION;
:REGION Validation;    /* 4 procedures;
	...
:ENDREGION;
:REGION Persistence;    /* 5 procedures;
	...
:ENDREGION;
:REGION Notification;    /* 6 procedures;
	...
:ENDREGION;
```

### Bad

```text
/* 520 code lines and 15 local procedures in call order, with validation,
   persistence and notification procedures interleaved and no regions;
```
