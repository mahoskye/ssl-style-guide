---
id: state_object_for_multistep
title: One state object for a multi-step operation
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  When the steps of a multi-step operation share more state than a few
  parameters carry, create one descriptive UDObject, initialize every
  property during request construction, and pass it through the steps; a
  short linear script keeps plain locals.
categories: [objects, simplicity]
related_elements: [CreateUdObject]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Validation And Boundary
    Contracts"), which lists the properties to initialize: flags, IDs,
    counters, stable failure code and sanitized failure message. The
    refactoring guide's state object pattern shows the same. Narrowed
    2026-10-21 under program decision 0002: the baseline already says not
    to force state objects into a short linear service.
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
