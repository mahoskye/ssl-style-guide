---
id: server_script_file_shape
title: Server script file shape
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script]
rule: >-
  Order a nontrivial server script as: file banner; top-level `:PARAMETERS`,
  contiguous `:DEFAULT` statements and `:DECLARE`; default state
  initialization; main orchestration; then local procedures grouped into
  responsibility-based regions.
categories: [module-structure]
related_elements: [PARAMETERS, DEFAULT, DECLARE, PROCEDURE]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("File Shape"). Merged: its "Keep
    top-level parameters and declarations before the first region", and the
    schema's module_structure.standard_order, which lists the same sequence.
---

## Rationale

A reader finds the contract (banner and parameters) first, then the business
flow, and only then the helpers that implement it.

## Exceptions

A short script with no local procedures needs no regions.

## Examples

### Good

```ssl
/* ********************************************************************************
Description.. : Records a status change for one sample.
Parameters... : sSampleId - Sample to update
Returns...... : {.T., NIL} on success
                {.F., {sCode, sMessage}} on failure
Date......... : 2026-10-13
********************************************************************************;
:PARAMETERS sSampleId;
:DEFAULT sSampleId, "";
:DECLARE aResult;

aResult := DoProc("ChangeStatus", {sSampleId});

:RETURN aResult;

/* region Status changes;

/*
 * Procedure: ChangeStatus
 * Description: Writes the status change.
 * Parameters:
 *   sSampleId - Sample to update
 * Returns: aResult - {.T., NIL} on success or a failure envelope
;
:PROCEDURE ChangeStatus;
	:PARAMETERS sSampleId;
	:RETURN ExecFunction("Samples.WriteStatus", {sSampleId});
:ENDPROC;

/* endregion;
```

### Bad

```text
:PROCEDURE ChangeStatus; ... :ENDPROC;
:PARAMETERS sSampleId;          (parameters after a procedure)
/* region Main;
:DECLARE aResult;               (declarations inside a region)
```
