---
id: identifier_length_limits
title: Identifier length limits
domain: naming
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Keep variable names to 20 characters after the type prefix, and procedure
  and function names to 30 characters.
categories: [naming]
related_elements: [DECLARE, PROCEDURE]
enforced_by: [lsp:diag.identifier_too_long]
schema:
  - path: naming.length_limits.variable_body_max
    form: value
    value: 20
  - path: naming.length_limits.procedure_name_max
    form: value
    value: 30
  - path: performance_guidelines.variable_naming.max_length
    form: value
    value: 20
verification:
  basis: convention
  note: >-
    Merged from the schema's naming.length_limits and
    performance_guidelines.variable_naming.max_length ("variable characters
    after the type prefix; 30 for procedure and function names") and the
    agent guide's and refactoring guide's length limits. The prefix does not
    count toward the 20.
---

## Rationale

Short names fit on a line next to the code that uses them. The limit counts
the body after the prefix, so the prefix never costs a character.

## Examples

### Good

```ssl
:DECLARE sCustomerOrderNo;
sCustomerOrderNo := "A1";
```

### Bad

```ssl
:DECLARE sCustomerOrderNumberXY;
sCustomerOrderNumberXY := "A1";
```
