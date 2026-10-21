---
id: return_what_callers_use
title: Return what the callers use
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Return the plain value when callers only use the value; use a
  success/failure envelope only when a caller branches on the outcome, and
  add no result field that no caller reads.
categories: [simplicity, procedures]
machine: { list: must_follow }
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From the design philosophy (agent-guides/ssl_design_philosophy.md) and
    program decision 0002. Narrows when the envelope rules
    (success_envelope_without_data, envelope_one_line) apply.
---

## Rationale

An envelope makes every caller unpack and check it. When no caller does
anything different on failure, that is ceremony at every call site, and the
failure branch is code nobody runs.

## Exceptions

A public script whose callers are not all known, such as a web service entry
point, keeps its documented envelope.

## Examples

### Good

```ssl
:PROCEDURE SampleOwner;
	:PARAMETERS sSampleId;

	:RETURN LSearch("SELECT owner FROM samples WHERE sample_id = ?", "",,
	                {sSampleId});
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE SampleOwner;
	:PARAMETERS sSampleId;
	:DECLARE sOwner;

	sOwner := LSearch("SELECT owner FROM samples WHERE sample_id = ?", "",,
	                  {sSampleId});

	:RETURN {.T., sOwner};
:ENDPROC;
```

## Notes

In the Bad example the procedure never returns `.F.`, so every caller's
success check is dead code.
