---
id: for_numeric_values
title: :FOR values are numeric
domain: language
status: active
level: authoritative
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Keep the `:FOR` loop variable, start, limit and step numeric; a non-numeric
  value raises an error.
categories: [loops, types]
related_elements: [FOR, TO, STEP]
enforced_by: [lsp:diag.for_numeric_values]
schema:
  - path: lints.type_safety
    form: lint
    message: >-
      :FOR loop variable, start, limit, and step must all be numeric.
      Non-numeric values cause error.
verification:
  basis: reference
  note: Kept from the schema lint for_numeric_values, whose message stays word for word.
---

## Rationale

The loop compares and steps its variable arithmetically, so every value in the
header must be a number.

## Examples

### Good

```ssl
:DECLARE i, nTotal;

nTotal := 0;

:FOR i := 1 :TO 3;
	nTotal += i;
:NEXT;
```

### Bad

```ssl
:DECLARE i, nTotal;
nTotal := 0;
:FOR i := "a" :TO 3;
	nTotal += 1;
:NEXT;
```
