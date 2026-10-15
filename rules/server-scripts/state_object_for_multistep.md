---
id: state_object_for_multistep
title: One state object for a multi-step operation
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  For a multi-step operation, create one descriptive UDObject, initialize
  every property during request construction, and pass that object through
  cohesive steps rather than growing long positional parameter lists.
categories: [objects]
related_elements: [CreateUdObject]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Validation And Boundary
    Contracts"), which lists the properties to initialize: flags, IDs,
    counters, stable failure code and sanitized failure message. The
    refactoring guide's state object pattern shows the same.
---

## Rationale

Every step sees the same named state, and a new piece of state is a new
property, not a new parameter on every procedure.

## Examples

### Good

```ssl
:PROCEDURE BuildRequest;
	:PARAMETERS sOrdNo;
	:DECLARE oState;

	oState := CreateUdObject();
	oState:ordNo := sOrdNo;
	oState:isValid := .F.;
	oState:failureCode := "";
	oState:failureMessage := "";

	:RETURN oState;
:ENDPROC;
```

### Bad

```text
DoProc("ApplyStep", {sOrdNo, bValid, nCount, sCode, sMessage, bStarted, bCommit});
```
