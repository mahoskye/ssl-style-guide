---
id: catch_only_to_act
title: Catch an error only to act on it
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Catch an error only to roll back or finish work, to return a failure result
  a caller branches on, or to add context the error lacks; otherwise let it
  propagate to the boundary that owns it.
categories: [simplicity, error-handling]
machine: { list: must_follow }
related_elements: [TRY, CATCH, GetLastSSLError]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From the design philosophy (agent-guides/ssl_design_philosophy.md) and
    program decision 0002. Narrows when to wrap; no_silent_error_swallowing
    and wrap_execfunction_for_envelope still govern how.
---

## Rationale

A `:TRY` that turns one failure into a vaguer one hides the detail the
maintainer needs and adds a block that does nothing useful. An error that
reaches the owning boundary intact is easier to diagnose than one translated
at every layer.

## Exceptions

Transaction finalization is real work: keep the `:TRY` / `:FINALLY` that
ends a transaction the procedure started.

## Examples

### Good

```text
LoadOwner calls LSearch with no :TRY. A database error reaches the entry
point, whose one :CATCH logs it and returns the service's failure envelope.
```

### Bad

```text
LoadOwner wraps LSearch in :TRY, and its :CATCH returns
{.F., {"DB_ERROR", "Could not load the owner."}}, discarding the error text.
Its caller wraps the call in another :TRY that does the same.
```
