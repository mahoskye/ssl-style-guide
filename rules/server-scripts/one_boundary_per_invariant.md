---
id: one_boundary_per_invariant
title: Each invariant has one owning boundary
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Assign each invariant to one authoritative boundary; repeat a check
  downstream only when it protects a distinct local use, enforces a stronger
  invariant, receives independently supplied data, or defends an
  independently deployed public contract.
categories: [error-handling, simplicity]
machine: { list: must_follow }
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Validation And Boundary
    Contracts"). Merged: its "Necessity And Proportionality" paragraph on
    repeated validation, which states the same test.
---

## Rationale

The same check repeated at every layer adds code without adding safety, and
the copies drift apart. A check belongs where the value first becomes
trustworthy; later layers rely on that contract unless they have their own
reason to check.

## Examples

### Good

```text
Main validates sSampleId once, then passes it to LoadSample and WriteStatus.
WriteStatus checks LimsRecordsAffected() == 1 (its own mutation guard).
```

### Bad

```text
Main, LoadSample and WriteStatus each re-check that sSampleId is non-empty.
```
