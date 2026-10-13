---
id: comma_spacing
title: A space after each comma
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Put a space after each comma and none before it.
categories: [formatting]
enforced_by: [lsp:fmt.comma_spacing]
schema:
  - path: formatting.spaces.after_comma
    form: value
    value: true
verification:
  basis: convention
  note: >-
    Kept from the format skill ("Space after commas, not before") and the
    refactoring guide's spacing table. The schema's
    formatting.spaces.after_comma says the same, and the refactoring guide's
    checklist ("Spaces after commas") repeats it.
---

## Rationale

A space after each comma separates arguments and list items at a glance, and
it is what the formatter produces.

## Exceptions

Skipped optional arguments keep their commas adjacent, with no space between
them (`RunSQL(sSql,, aValues)`).

## Examples

### Good

```ssl
:DECLARE aItems;
aItems := {1, 2, 3};
```

### Bad

```ssl
:DECLARE aItems;
aItems := {1 ,2,3};
```
