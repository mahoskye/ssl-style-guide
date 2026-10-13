---
id: banner_special_result_first
title: A special result comes first on the Returns line
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Keep a special non-envelope result on its own `Returns` continuation line
  before the handled success and failure shapes.
categories: [module-structure]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's banner bullets, which state it
    word for word.
---

## Rationale

A result that is not an envelope needs different handling, so it is listed
first, where a caller looks.

## Examples

### Good

```text
Returns...... : NIL when the request is a replay of a completed one
                {.T., NIL} on success
                {.F., {sCode, sMessage}} on failure
```

### Bad

```text
Returns...... : {.T., NIL} on success, or NIL for a replay
                {.F., {sCode, sMessage}} on failure
```
