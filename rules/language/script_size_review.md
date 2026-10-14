---
id: script_size_review
title: A large server script is a prompt to check its responsibilities
domain: language
status: active
level: advisory
severity: info
applies_to: [server_script]
rule: >-
  Treat a server script with more than 400 code lines or more than 12 local
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
verification:
  basis: observed
  note: >-
    The thresholds are provisional: they sit near the top of the script sizes
    measured in a production snapshot (75th percentile about 35 code lines,
    95th about 115) and will be replaced once a size survey of the v12 base
    layer is available. The trigger restates the server-script style guide's
    "line count and procedure count are review triggers, not acceptance
    limits" with numbers. No starlims-lsp diagnostic measures script size yet,
    so a reviewer applies it.
---

## Rationale

Most server scripts are small. In a production snapshot the 75th percentile of
script size was about 35 code lines and the 95th about 115, so a script past
400 code lines or 12 local procedures is well beyond the top of normal and
likely holds more than one responsibility. Regions that group related
procedures by responsibility make such a script navigable without changing how
it runs. Moving a responsibility to its own script has a cost: a call through
`ExecFunction` resolves its string target at run time and crosses into a
separate deployment unit, where a local `DoProc` stays inside the file. Pay
that cost only for a responsibility that is reusable on its own or owned
independently.

## Exceptions

The numbers are review triggers, not limits. Never split a script only to get
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
