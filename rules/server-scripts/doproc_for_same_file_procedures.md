---
id: doproc_for_same_file_procedures
title: Call same-file procedures with DoProc
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script]
rule: >-
  Use `DoProc("ProcName", {args})` for same-file script procedures.
categories: [procedures]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [DoProc]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the procedures pack and the foundation, which state it word for
    word. The server-script baseline, the agent guide (quick start rule 5 and
    "Calling Convention") and the skills' rule lists say the same.
---

## Rationale

A script procedure is not a function name the caller can use directly.
`DoProc` looks the name up in the current script, case-insensitively, and
passes the array's elements as the procedure's parameters.

## Examples

### Good

```ssl
:PROCEDURE Main;
	:PARAMETERS sSampleId;
	:DECLARE sStatus;

	sStatus := DoProc("LoadStatus", {sSampleId});

	:RETURN sStatus;
:ENDPROC;

:PROCEDURE LoadStatus;
	:PARAMETERS sSampleId;

	:RETURN Upper(sSampleId);
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Main;
	:PARAMETERS sSampleId;
	:DECLARE sStatus;

	sStatus := ExecFunction("LoadStatus", {sSampleId});
	:RETURN sStatus;
:ENDPROC;

:PROCEDURE LoadStatus;
	:PARAMETERS sSampleId;
	:RETURN Upper(sSampleId);
:ENDPROC;
```

## Notes

A one-segment `ExecFunction("Name")` looks for a script in the default
categories, not a procedure in the current script, so the bad example does
not reach `LoadStatus`.
