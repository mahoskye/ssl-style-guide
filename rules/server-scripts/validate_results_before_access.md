---
id: validate_results_before_access
title: Validate a result before reading its payload
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  At every procedure or service boundary, validate an outer array, its
  required length and its success flag before reading an envelope payload,
  and validate the payload's shape and field types before indexing arrays or
  accessing object properties.
categories: [error-handling]
related_elements: [LimsTypeEx, ALen, HasProperty]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Merged: the server-script baseline's first two boundary bullets (kept,
    joined into one statement) and its completion check "Every external
    result is validated before payload access".
---

## Rationale

Indexing a value that is not an array, or reading a property an object does
not have, raises at run time. Checking the shape first turns a malformed
result into a handled contract failure instead of an error deep in the
caller.

## Examples

### Good

```ssl
:PROCEDURE LoadOwner;
	:PARAMETERS sSampleId;
	:DECLARE aResult;

	aResult := ExecFunction("Samples.Load", {sSampleId});

	:IF LimsTypeEx(aResult) != "ARRAY" .OR. ALen(aResult) < 2;
		:RETURN {.F., {"SAMPLE_CONTRACT", "Invalid sample result."}};
	:ENDIF;

	:IF !aResult[1];
		:RETURN aResult;
	:ENDIF;

	:IF LimsTypeEx(aResult[2]) != "OBJECT";
		:RETURN {.F., {"SAMPLE_CONTRACT", "Invalid sample result."}};
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
