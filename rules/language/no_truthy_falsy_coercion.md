---
id: no_truthy_falsy_coercion
title: Conditions are logical values
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Conditions in `:WHILE` and `:CASE`, and the left operand of `.AND.`/`.OR.`,
  must be logical values; there is no truthy/falsy coercion, and other types,
  including `NIL`, raise an error.
categories: [control-flow, types]
related_elements: [WHILE, CASE, and, or]
enforced_by: [reviewer]
schema:
  - path: expressions.logical_evaluation.nil_evaluates
    form: value
    value: error
verification:
  basis: reference
  note: >-
    Kept from the agent guide's Boolean details ("No truthy/falsy coercion"),
    with the schema comment on expressions.logical_evaluation.nil_evaluates
    ("including NIL ... is not coerced to .F.") merged in. starlims-lsp
    v0.24.0 does not report a non-boolean condition.
---

## Rationale

SSL does not treat `0`, `""` or `NIL` as false. A number or string in a
condition raises an error when the condition runs.

## Examples

### Good

```ssl
:DECLARE nCount;
nCount := 3;
:WHILE nCount > 0;
	nCount -= 1;
:ENDWHILE;
```

### Bad

```ssl
:DECLARE nCount;
nCount := 3;
:WHILE nCount;
	nCount -= 1;
:ENDWHILE;
```
