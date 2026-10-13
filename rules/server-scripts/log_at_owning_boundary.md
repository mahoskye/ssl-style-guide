---
id: log_at_owning_boundary
title: Log a failure once, where it is owned
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Log a diagnostic only at the boundary that owns the failed operation.
categories: [error-handling, logging]
related_elements: [ErrorMes, GetLastSSLError]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From the server-script baseline's catch steps (step 3) and the note that
    a boundary that intentionally delegates logging does not add diagnostic
    handling.
---

## Rationale

When every layer logs the same failure, one error becomes several log entries
with less context each. The boundary that owns the operation knows what was
being attempted; callers translate or propagate its result.

## Examples

### Good

```text
WriteStatus (owns the write)  -> logs the diagnostic, returns {.F., {code, message}}
ChangeStatus (caller)         -> propagates the envelope, does not log again
```

### Bad

```text
WriteStatus   -> logs the diagnostic, returns a failure envelope
ChangeStatus  -> logs the same failure again
Main          -> logs it a third time
```
