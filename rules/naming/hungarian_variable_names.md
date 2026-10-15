---
id: hungarian_variable_names
title: Hungarian camelCase variable names
domain: naming
status: active
level: style_only
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Variables use Hungarian-style camelCase: a type prefix, then a camelCase
  body (`sMyVar`, not `s_my_var` or `SMYVAR`).
categories: [naming]
machine: { list: must_follow }
related_elements: [DECLARE, PARAMETERS]
enforced_by: [reviewer]
schema:
  - path: naming.variables
    form: value
    value: hungarian_camelCase
  - path: performance_guidelines.variable_naming.hungarian_notation_required
    form: value
    value: true
verification:
  basis: convention
  note: >-
    Kept from the naming pack's "Variables use Hungarian-style camelCase.",
    with the review skill's example ("sMyVar, not s_my_var or SMYVAR")
    merged in. The schema's naming.variables and
    performance_guidelines.variable_naming say the same. The strict validator
    profile does not run starlims-lsp's naming audit.
---

## Rationale

The prefix tells the reader the type without a lookup, and the camelCase body
keeps names readable in a case-insensitive language.

## Exceptions

Declared loop counters (see `loop_counter_names`), constants, and the literals
`NIL`, `.T.` and `.F.`.

## Examples

### Good

```ssl
:DECLARE sUserName, nCount;

sUserName := "admin";
nCount := 0;
```

### Bad

```ssl
:DECLARE user_name, COUNT;
user_name := "admin";
COUNT := 0;
```
