---
id: prefix_matches_type
title: A prefix matches the value's type
domain: naming
status: active
level: style_only
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Make a variable's prefix match the type of the value it holds: `s` string,
  `n` numeric, `b` boolean, `d` date, `a` array, `o` object, `fn` code block,
  `v` variant/any.
categories: [naming]
related_elements: [DECLARE]
enforced_by: [lsp:diag.hungarian_type_mismatch]
verification:
  basis: convention
  note: >-
    Kept from the review skill's naming check ("Prefix mismatch: s = string, n
    = numeric, ..."). The refactor skill's prefix list says the same.
---

## Rationale

A prefix that disagrees with the value misleads every reader, and usually
points to a real type error.

## Examples

### Good

```ssl
:DECLARE nCount;
nCount := 0;
```

### Bad

```ssl
:DECLARE sCount;
sCount := 0;
```
