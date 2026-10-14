---
id: execfunction_for_external_scripts
title: Call other scripts with ExecFunction
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Use `ExecFunction("Category.Script", {args})` or
  `ExecFunction("Category.Script.Proc", {args})` for external script entry
  points.
categories: [procedures]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [ExecFunction]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the procedures pack and the foundation, which state it word for
    word. The server-script baseline, the agent guide (quick start rule 5 and
    "Calling Convention") and the skills' rule lists say the same.
---

## Rationale

A deployed script is addressed by its category and script name. The
two-segment form runs the script's top-level code; the three-segment form runs
one procedure in it. The array's elements become the target's parameters.

## Examples

### Good

```ssl
:PROCEDURE Main;
	:PARAMETERS sSampleId;
	:DECLARE aResult;

	aResult := ExecFunction("Samples.ChangeStatus", {sSampleId, "A"});

	:RETURN aResult;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Main;
	:PARAMETERS sSampleId;
	:DECLARE aResult;

	aResult := DoProc("ChangeStatus", {sSampleId, "A"});
	:RETURN aResult;
:ENDPROC;
```

## Notes

In the bad example `ChangeStatus` lives in another script, but a one-segment
`DoProc` target is looked up only in the current script.
