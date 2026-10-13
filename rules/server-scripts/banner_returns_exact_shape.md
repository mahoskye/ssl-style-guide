---
id: banner_returns_exact_shape
title: The banner states the exact result shape
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  State the exact result shape on the banner's `Returns......` line; when a
  script returns an outer envelope, describe the success and failure payloads
  on separate aligned continuation lines.
categories: [module-structure]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("File And Procedure
    Documentation"). It also gives the Success:/Failure: label form for
    descriptions that wrap. The schema's banner template says "Exact result
    shape - success and failure on separate lines".
---

## Rationale

A caller writes its envelope check from this line. "Returns an array" does not
say which element is the flag or what a failure carries.

## Examples

### Good

```text
Returns...... : {.T., NIL} on success
                {.F., {sCode, sMessage}} on failure
```

### Bad

```text
Returns...... : array
```
