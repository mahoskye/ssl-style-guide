---
id: nil_not_empty_string
title: NIL is not an empty string, zero or .F.
domain: language
status: active
level: authoritative
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Do not treat `NIL` as an empty string, zero or `.F.`; declared variables
  start as an empty string, not `NIL`.
categories: [types]
related_elements: [nil, DECLARE]
enforced_by: [lsp:diag.nil_not_empty_string]
schema:
  - path: lints.type_safety
    form: lint
    message: >-
      NIL is not the same as empty string, zero, or .F. — all declared
      variables initialize to empty string, not NIL. NIL = NIL is .T., NIL =
      "" is .F.
verification:
  basis: reference
  note: >-
    Kept from the schema lint nil_not_empty_string, whose message stays word
    for word. Gotcha 19 ("All declared variables start as empty string") says
    the same.
---

## Rationale

`NIL = ""` is `.F.`. A freshly declared variable holds `""`, so a `NIL` test
on it is never true.

## Examples

### Good

```ssl
:DECLARE sName, bMissing;
bMissing := sName == "";
```

### Bad

```ssl
:DECLARE bMissing;
bMissing := NIL == "";
```
