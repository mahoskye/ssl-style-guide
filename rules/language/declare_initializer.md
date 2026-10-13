---
id: declare_initializer
title: :DECLARE takes no initializer
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `:DECLARE` initializers (`:DECLARE x := 1;`): `:DECLARE` takes bare
  identifiers only — assign in a separate statement. Class constants are
  assigned in the Constructor.
categories: [procedures]
machine: { foundation: does_not_have }
related_elements: [DECLARE]
enforced_by: [lsp:diag.declare_initializer]
schema:
  - path: declarations.declare_rule
    form: value
    value: ":DECLARE a, b, c;"
verification:
  basis: reference
  note: >-
    Kept from the foundation's "SSL Does Not Have" list, which states it word
    for word. The schema's declarations.declare_rule shows the bare form.
---

## Rationale

`:DECLARE` only creates names. A value goes in an assignment on the next line.

## Examples

### Good

```ssl
:DECLARE nCount;
nCount := 1;
```

### Bad

```ssl
:DECLARE nCount := 1;
```
