---
id: member_access_no_spaces
title: No spaces around member-access colons
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Prefer no spaces around `:` in member access even though SSL accepts spaced
  forms.
categories: [objects, operators]
machine: { list: must_follow }
related_elements: [me, base]
enforced_by: [lsp:fmt.operator_spacing]
schema:
  - path: property_method_access.formatting.no_spaces_around_colon
    form: value
    value: preferred
verification:
  basis: convention
  note: >-
    Kept from the agent guide's style guidance rule 2. Merged: the objects and
    operators packs' "Use no spaces around member access colon.", the review
    and refactor skills, and the schema's
    property_method_access.formatting.no_spaces_around_colon.
---

## Rationale

`oEmail:Subject` reads as one operand. The formatter removes spaces around a
member-access colon.

## Examples

### Good

```ssl
:DECLARE oEmail;

oEmail := Email{};
oEmail:Subject := "Results ready";
```

### Bad

```ssl
:DECLARE oEmail;
oEmail := Email{};
oEmail : Subject := "Results ready";
```
