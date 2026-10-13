---
id: array_literal_braces
title: Array literals use braces
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `[a, b]` array literals: array literals use braces `{1, 2, 3}`; square
  brackets are for indexing (`aRows[1]`) and are also a string literal form
  (`[text]`), never an array constructor.
categories: [arrays]
machine: { foundation: does_not_have }
related_elements: [ArrayNew]
enforced_by: [reviewer]
schema:
  - path: expressions.arrays.literal_braces
    form: value
    value: true
verification:
  basis: reference
  note: >-
    Kept from the foundation's "SSL Does Not Have" list, which states it word
    for word. The schema's expressions.arrays.literal_braces says the same.
---

## Rationale

`[1, 2]` is a string literal holding the text `1, 2`, not an array.

## Examples

### Good

```ssl
:DECLARE aItems;
aItems := {1, 2};
```

### Bad

```ssl
:DECLARE aItems;
aItems := [1, 2];
```
