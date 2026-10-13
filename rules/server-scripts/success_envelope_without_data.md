---
id: success_envelope_without_data
title: "{.T., NIL} for a step with no success data"
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Use `{.T., NIL}` for internal command steps that use a standard envelope but
  have no success data.
categories: [error-handling]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's boundary rules, which state it
    word for word.
---

## Rationale

One success shape for every data-less step keeps the caller's envelope check
the same everywhere: test the flag, and read the payload only when there is
one.

## Examples

### Good

```ssl
:PROCEDURE WriteAudit;
	:PARAMETERS sSampleId;

	ExecFunction("Samples.Audit", {sSampleId});

	:RETURN {.T., NIL};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE WriteAudit;
	:PARAMETERS sSampleId;

	ExecFunction("Samples.Audit", {sSampleId});

	:RETURN {.T., "OK"};
:ENDPROC;
```
