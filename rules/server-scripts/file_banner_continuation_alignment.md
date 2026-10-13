---
id: file_banner_continuation_alignment
title: Banner continuation lines align after the colon
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Continuation lines align under the first character after `: `.
categories: [module-structure]
enforced_by: [reviewer]
schema:
  - path: documentation.file_banner.rules
    form: text
    message: Continuation lines align under the first character after the colon and space.
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's banner bullets. The schema's
    documentation.file_banner.rules states it in words ("after the colon and
    space").
---

## Rationale

Aligned continuations keep each field's value in one column, so a multi-line
`Parameters` or `Returns` entry reads as one value.

## Examples

### Good

```text
Parameters... : sSampleId - Sample to update
                sStatus   - New status value
```

### Bad

```text
Parameters... : sSampleId - Sample to update
    sStatus - New status value
```
