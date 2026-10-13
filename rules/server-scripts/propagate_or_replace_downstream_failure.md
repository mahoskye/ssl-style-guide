---
id: propagate_or_replace_downstream_failure
title: Keep valid downstream failures, replace malformed ones
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  When propagating a failure envelope, preserve a valid downstream stable code
  and sanitized message, and replace a malformed downstream result with a
  stable contract-failure code owned by the caller.
categories: [error-handling]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Merged: the server-script baseline's third and fourth boundary bullets
    (kept, joined into one statement).
---

## Rationale

A valid downstream code already says what went wrong, and replacing it hides
that from the caller. A malformed result has no code to keep, so the caller
names the broken contract with a code of its own.

## Examples

### Good

```text
downstream returns {.F., {"SAMPLE_LOCKED", "The sample is locked."}}
  -> return it unchanged
downstream returns "OK" (not an envelope)
  -> return {.F., {"SAMPLE_CONTRACT", "The sample service returned an invalid result."}}
```

### Bad

```text
downstream returns {.F., {"SAMPLE_LOCKED", "The sample is locked."}}
  -> return {.F., {"FAILED", "Something went wrong."}}
downstream returns "OK" (not an envelope)
  -> return {.T., NIL}
```
