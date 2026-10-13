---
id: not_preferred_operator
title: Prefer != for not-equals
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Prefer `!=` over `<>` or `#` for not-equals.
categories: [operators]
related_elements: [not-equals, not-equals-legacy, hash]
enforced_by: [lsp:diag.not_preferred_operator]
schema:
  - path: "lints.not_preferred_operators.#.message"
    form: text
    message: "Not preferred — use != instead of # for inequality."
  - path: lints.not_preferred_operators.<>.message
    form: text
    message: "Not preferred — use != instead of <> for inequality."
verification:
  basis: convention
  note: >-
    Kept from the agent guide's operators summary ("prefer != over <> or #
    for not-equals"). Merged: the schema's two not_preferred_operators
    entries, whose messages stay word for word.
---

## Rationale

The three operators behave the same. Using one of them everywhere keeps
comparisons easy to scan.

## Examples

### Good

```ssl
:DECLARE nCount, bDiff;
nCount := 1;
bDiff := nCount != 2;
```

### Bad

```ssl
:DECLARE nCount, bDiff;
nCount := 1;
bDiff := nCount # 2;
bDiff := nCount <> 2;
```
