---
id: explicit_type_conversion
title: Convert types explicitly
domain: language
status: active
level: authoritative
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Convert types explicitly with `Val()` and `LimsString()`; only date ± number
  and date - date coerce.
categories: [types, dates]
machine: { list: must_follow }
related_elements: [Val, LimsString, CToD, DToC]
enforced_by: [lsp:diag.mixed_type_operator]
schema:
  - path: language_features.data_types.type_conversion
    form: value
    value: explicit
verification:
  basis: reference
  note: >-
    Kept from the types pack, which states it word for word. Merged: the dates
    pack's "Use documented date conversion functions rather than assuming
    implicit coercion." and the schema's
    language_features.data_types.type_conversion.
---

## Rationale

`"Total: " + 5` raises: `+` needs two strings or two numbers. Only adding or
subtracting days on a date, and subtracting two dates, mix types.

## Examples

### Good

```ssl
:DECLARE sMessage;

sMessage := "Total: " + LimsString(5);
```

### Bad

```ssl
:DECLARE sMessage;
sMessage := "Total: " + 5;
```
