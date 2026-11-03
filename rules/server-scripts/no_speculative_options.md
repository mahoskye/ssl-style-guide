---
id: no_speculative_options
title: Nothing for a need nobody has stated
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Add no parameter, option, branch or result field for a need that no caller,
  requirement or task has stated.
categories: [simplicity]
machine: { list: avoid }
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From the design philosophy (agent-guides/ssl_design_philosophy.md) and
    program decision 0002, which excludes configurability "for later". The
    server-script baseline's "Necessity And Proportionality" states the same
    for result fields and failure taxonomies.
---

## Rationale

Speculative options have to be read, documented and kept working, and they
rarely match the need when it finally arrives. Adding a parameter later, when
a caller needs it, costs one change.

## Examples

### Good

```text
:PARAMETERS sSampleId; for a script whose callers all look up one sample.
```

### Bad

```text
:PARAMETERS sSampleId, bIncludeHistory, sSortOrder, nMaxRows; with defaults,
for a script whose callers all pass only sSampleId.
```
