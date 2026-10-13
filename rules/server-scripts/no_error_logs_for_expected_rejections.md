---
id: no_error_logs_for_expected_rejections
title: Expected rejections are not infrastructure errors
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Do not log expected guard rejections, replay conflicts, or caller validation
  failures as infrastructure errors unless the operation specifically requires
  that audit signal.
categories: [logging]
related_elements: [ErrorMes]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("External Calls And Error
    Handling"), which states it word for word.
---

## Rationale

`[ERROR]` entries are what operators search for when something breaks. A
caller sending an invalid request is normal operation; logging it as an error
buries the real failures.

## Examples

### Good

```ssl
:PROCEDURE CheckSample;
	:PARAMETERS sSampleId;

	:IF Empty(sSampleId);
		:RETURN {.F., {"SAMPLE_REQUIRED", "Enter a sample id."}};
	:ENDIF;

	:RETURN {.T., NIL};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CheckSample;
	:PARAMETERS sSampleId;

	:IF Empty(sSampleId);
		ErrorMes("[ERROR] CheckSample", "Empty sample id");
		:RETURN {.F., {"SAMPLE_REQUIRED", "Enter a sample id."}};
	:ENDIF;

	:RETURN {.T., NIL};
:ENDPROC;
```
