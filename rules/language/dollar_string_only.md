---
id: dollar_string_only
title: $ takes string operands
domain: language
status: active
level: authoritative
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use the `$` containment operator only on strings; non-string operands raise
  an error.
categories: [strings, operators]
related_elements: [dollar]
enforced_by: [lsp:diag.dollar_string_only]
schema:
  - path: lints.type_safety
    form: lint
    message: >-
      The $ containment operator only works on strings. Non-string operands
      cause error.
verification:
  basis: reference
  note: Kept from the schema lint dollar_string_only, whose message stays word for word.
---

## Rationale

`$` searches one string for another. A number or array on either side raises
when the expression runs.

## Examples

### Good

```ssl
:DECLARE sCodes, bFound;
sCodes := "PH,TOC,TSS";
bFound := "TOC" $ sCodes;
```

### Bad

```ssl
:DECLARE nCount, bFound;
nCount := 5;
bFound := 5 $ nCount;
```
