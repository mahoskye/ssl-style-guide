---
id: validate_results_before_access
title: Validate a result before reading its payload
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Check an envelope's success flag before reading its payload; validate the
  envelope's shape and the payload's field types only when the result comes
  from a separately deployed script or service without a documented
  contract, never for a procedure in the same file.
categories: [error-handling, simplicity]
machine: { list: must_follow }
related_elements: [LimsTypeEx, ALen, HasProperty]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Merged: the server-script baseline's first two boundary bullets (kept,
    joined into one statement) and its completion check "Every external
    result is validated before payload access". Narrowed 2026-10-21 under
    program decision 0002: shape checks only where the producer is not
    under the caller's control.
---

## Rationale

A failed result is a real outcome, so its flag is always checked. A malformed
result is not: a procedure in the same file, or a script whose contract is
documented, returns the shape it promises. Shape checks belong only where the
producer is outside the caller's control, where indexing a value that is not
an array would raise deep in the caller.

## Examples

### Good

```ssl
:PROCEDURE LoadOwner;
	:PARAMETERS sSampleId;
	:DECLARE aResult;

	aResult := ExecFunction("Samples.Load", {sSampleId});

	:IF !aResult[1];
		:RETURN aResult;
	:ENDIF;

	:RETURN {.T., aResult[2]:Owner};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE LoadOwner;
	:PARAMETERS sSampleId;
	:DECLARE aResult;

	aResult := ExecFunction("Samples.Load", {sSampleId});

	:RETURN {.T., aResult[2]:Owner};
:ENDPROC;
```
