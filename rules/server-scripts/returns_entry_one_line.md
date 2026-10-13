---
id: returns_entry_one_line
title: One physical line per Returns entry
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Keep each `Returns:` entry of a procedure doc block on one physical line,
  for hover documentation.
categories: [procedures]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("File And Procedure
    Documentation"). Its completion check ("Procedure comments use the
    standard block and one-line Returns: entry") says the same.
---

## Rationale

Editors show the `Returns:` line when hovering over a call. A wrapped entry
shows only its first part.

## Examples

### Good

```text
 * Returns: aResult - {.T., operation state} or failure envelope
```

### Bad

```text
 * Returns: aResult - {.T., operation state}
 *          or failure envelope
```
