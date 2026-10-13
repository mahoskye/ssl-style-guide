---
id: builtin_function_canonical_casing
title: Built-in functions keep their documented casing
domain: naming
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Represent functions in PascalCase where applicable, while preserving
  canonical exceptions such as `_AND`, `_OR`, `_XOR`, `_NOT`, `DOW`, `DOY`,
  and `LIMSDate`.
categories: [naming, dates]
machine: { list: must_follow }
related_elements: [LIMSDate, DOW, DOY, AllTrim]
enforced_by: [lsp:fmt.builtin_function_case]
schema:
  - path: procedures.naming_conventions.rules
    form: text
    message: Preserve canonical exceptions such as _AND, _OR, _XOR, _NOT, DOW, DOY, and LIMSDate
verification:
  basis: convention
  note: >-
    Kept from the agent guide's gotcha 10, without its examples. Merged: the
    dates pack's "Keep canonical casing for LIMSDate, DOW, and DOY." and the
    schema's procedures.naming_conventions.rules entry for the exceptions.
    The neighboring naming_conventions entries ("Always use the exact casing
    from the function documentation", "Represent functions in PascalCase where
    applicable" and the per-category lines) say the same and stay
    hand-written there.
---

## Rationale

Function names are case-insensitive, so any casing runs. The documented
casing makes code searchable and consistent with the reference.

## Examples

### Good

```ssl
:DECLARE sName;
sName := AllTrim(" a ");
```

### Bad

```ssl
:DECLARE sName;
sName := ALLTRIM(" a ");
```
