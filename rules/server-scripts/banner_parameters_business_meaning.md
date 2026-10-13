---
id: banner_parameters_business_meaning
title: Banner parameters state their business meaning
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Define every banner parameter by its exact business meaning.
categories: [module-structure]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's banner bullets, which state it
    word for word.
---

## Rationale

The banner is the caller's contract. A type alone says what to pass, not which
value.

## Examples

### Good

```text
Parameters... : sSampleId - Sample to update
                sStatus   - New status value
```

### Bad

```text
Parameters... : sSampleId - string
                sStatus   - string
```
