---
id: preserve_acronym_casing
title: Preserve established acronym casing
domain: naming
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Preserve established acronym casing only when it already exists in the
  surrounding codebase or required external names.
categories: [naming]
enforced_by: [reviewer]
schema:
  - path: lints.hungarian_notation.exceptions.preserve_existing_acronym_casing
    form: value
    value: true
verification:
  basis: convention
  note: >-
    Kept from the agent guide's naming exceptions, which state it word for
    word. Merged: the schema's preserve_existing_acronym_casing.
---

## Rationale

Matching an acronym's existing casing keeps a name consistent with the code
and external names around it; new names follow the normal camelCase body.

## Examples

### Good

```ssl
:DECLARE sQCStatus;

/* QC is spelled this way throughout this script;
sQCStatus := "Passed";
```

### Bad

```text
New code in a script that writes sQcStatus everywhere introduces sQCStatus.
```
