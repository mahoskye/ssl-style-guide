---
id: constants_upper_snake_case
title: Constants are UPPER_SNAKE_CASE
domain: naming
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Constants use UPPER_SNAKE_CASE.
categories: [naming]
machine: { list: must_follow }
related_elements: [DECLARE]
enforced_by: [reviewer]
schema:
  - path: naming.constants
    form: value
    value: UPPER_SNAKE_CASE
verification:
  basis: convention
  note: >-
    Kept from the naming pack, which states it word for word. Merged: the
    review skill, the agent guide's and refactoring guide's naming
    exceptions, and the schema's naming.constants.
---

## Rationale

Uppercase names mark a value that is set once and read many times, and they
take no type prefix.

## Examples

### Good

```ssl
:DECLARE MAX_ATTEMPTS;
MAX_ATTEMPTS := 3;
```

### Bad

```ssl
:DECLARE maxAttempts;
maxAttempts := 3;
```
