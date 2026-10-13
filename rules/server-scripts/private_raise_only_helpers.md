---
id: private_raise_only_helpers
title: Raise-only helpers are /*@private;
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script]
rule: >-
  Mark raise-only helper procedures `/*@private;` so callers cannot bypass the
  entry point that catches their errors.
categories: [error-handling, procedures]
related_elements: [RaiseError, PROCEDURE]
enforced_by: [reviewer]
schema:
  - path: error_handling.guidance.raise_error_doctrine
    form: text
verification:
  basis: convention
  note: >-
    Kept from the schema's raise_error_doctrine, which states it word for
    word. The agent guide's placement doctrine and the server-script baseline
    (the one required exception to unannotated procedures) say the same.
---

## Rationale

A helper that reports failure only by raising is safe only when called from
the entry point whose `:CATCH` turns the error into a result. `/*@private;`
blocks calls from other scripts, so no caller can reach the helper without
that boundary.

## Examples

### Good

```ssl
:PROCEDURE Main;
	:PARAMETERS sSampleId;

	:TRY;
		DoProc("RequireSample", {sSampleId});
	:CATCH;
		ClearLastSSLError();
		:RETURN {.F., {"SAMPLE_REQUIRED", "A sample is required."}};
	:ENDTRY;

	:RETURN {.T., NIL};
:ENDPROC;

/*@private;
:PROCEDURE RequireSample;
	:PARAMETERS sSampleId;

	:IF Empty(sSampleId);
		RaiseError("A sample is required");
	:ENDIF;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Main;
	:PARAMETERS sSampleId;

	:TRY;
		DoProc("RequireSample", {sSampleId});
	:CATCH;
		ClearLastSSLError();
		:RETURN {.F., {"SAMPLE_REQUIRED", "A sample is required."}};
	:ENDTRY;

	:RETURN {.T., NIL};
:ENDPROC;

:PROCEDURE RequireSample;
	:PARAMETERS sSampleId;

	:IF Empty(sSampleId);
		RaiseError("A sample is required");
	:ENDIF;
:ENDPROC;
```

## Notes

Annotations affect script procedures only; on a class method they have no
effect (see `visibility_annotations_script_only`).
