---
id: pipeline_failure_capture
title: One failure contract per pipeline
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Use a pipeline-specific failure-capture helper when several sequential
  steps return standard envelopes, and keep one contract within the
  pipeline: either return a boolean or return `{success, state}`
  consistently.
categories: [error-handling]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Validation And Boundary
    Contracts"), which states it in two sentences, joined here.
---

## Rationale

One helper and one contract mean each step is checked the same way, and the
first failure is captured once.

## Examples

### Good

```text
:IF !DoProc("CaptureFailure", {oState, DoProc("ReserveStock", {oState})});
	:RETURN DoProc("FailureEnvelope", {oState});
:ENDIF;
:IF !DoProc("CaptureFailure", {oState, DoProc("WriteOrder", {oState})});
	:RETURN DoProc("FailureEnvelope", {oState});
:ENDIF;
```

### Bad

```text
aStep := DoProc("ReserveStock", {oState});
:IF !aStep[1];
	:RETURN aStep;
:ENDIF;
:IF !DoProc("WriteOrder", {oState});
	:RETURN {.F., {"WRITE_FAILED", "The order was not written."}};
:ENDIF;
```
