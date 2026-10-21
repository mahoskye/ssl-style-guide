---
id: trust_built_context_shape
title: Check a context object's shape once, where it is built
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Check a context object's shape once, in the procedure that builds it or
  where it is reloaded from storage or parsed from text; procedures that
  receive it later in the same flow use its properties without re-checking
  them.
categories: [simplicity, objects]
machine: { list: must_follow }
related_elements: [CreateUdObject, HasProperty, LimsTypeEx]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From program decision 0002 and the user's review of the ssl-tidy runs on
    a sequencing project (2026-10-21), where each step of a flow re-checked
    the properties of a context object an earlier step had built and
    checked. Applies one_boundary_per_invariant to context objects.
---

## Rationale

A builder that sets every property and checks its inputs establishes the
object's shape. Re-checking `HasProperty` and `LimsTypeEx` in every
procedure that receives it repeats that work, hides which procedure owns the
shape, and drifts when the builder changes.

## Exceptions

Checking identity or freshness is not checking shape: a context reloaded
from a queue or a saved record may be stale or belong to another attempt, and
a check that it still matches the current run stays. A context saved and
reloaded, or carried as JSON text, has its shape checked once where it is
reloaded or parsed.

## Examples

### Good

```text
BuildRunContext checks nRunId and sets runId, flowcellId and assayType.
LoadSamples and WriteSheet read oContext:runId and oContext:assayType directly.
```

### Bad

```text
LoadSamples and WriteSheet each begin with
:IF !HasProperty(oContext, "runId") .OR. LimsTypeEx(oContext:runId) != "NUMERIC";
although BuildRunContext, their only source of oContext, set and checked it.
```
