---
id: banner_success_failure_labels
title: Success and Failure labels when a Returns line wraps
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Use `Success:` and `Failure:` labels on the banner's `Returns` line when
  either description must wrap, and align continuations under the first
  character after the label.
categories: [module-structure]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's banner bullet on the Returns
    line; its first half is banner_returns_exact_shape.
---

## Rationale

Labels keep the two shapes apart once a description runs onto a second line.

## Examples

### Good

```text
Returns...... : Success: {.T., NIL} after the status and its audit row
                         are both written
                Failure: {.F., {sCode, sMessage}}
```

### Bad

```text
Returns...... : {.T., NIL} after the status and its audit row
                are both written
                {.F., {sCode, sMessage}}
```
