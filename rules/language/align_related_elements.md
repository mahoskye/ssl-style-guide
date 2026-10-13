---
id: align_related_elements
title: Align related elements
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Align related elements, such as parameters and SQL statements, for
  readability.
categories: [formatting]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the agent guide's style guidelines ("Align related elements
    (parameters, SQL statements) for readability"). The server-script
    baseline limits it: doc_block_parameter_alignment does not force large
    spacing or fragile visual columns.
---

## Rationale

Elements that line up can be compared at a glance, such as the parameter names
of a doc block or the clauses of a SQL statement.

## Examples

### Good

```text
/*
 * Parameters:
 *   sSampleId - Sample to update
 *   sStatus   - New status value
;
```

### Bad

```text
/*
 * Parameters:
 *   sSampleId - Sample to update
 *   sStatus - New status value
;
```
