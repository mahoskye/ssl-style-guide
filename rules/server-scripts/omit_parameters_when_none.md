---
id: omit_parameters_when_none
title: No :PARAMETERS without parameters
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Leave out `:PARAMETERS` and `:DEFAULT` when a procedure or method takes no
  parameters.
categories: [procedures]
related_elements: [PARAMETERS, DEFAULT]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the new-procedure skill ("omit :PARAMETERS and :DEFAULT blocks
    entirely") and the new-class skill ("If a method has no parameters, omit
    :PARAMETERS"). Data sources have their own rule,
    datasource_empty_parameters.
---

## Rationale

A procedure with no `:PARAMETERS` line takes no arguments; an empty
declaration adds nothing a reader needs.

## Examples

### Good

```ssl
:PROCEDURE Today;
	:RETURN Today();
:ENDPROC;
```

### Bad

```text
:PROCEDURE Today;
	:PARAMETERS;
	:RETURN Today();
:ENDPROC;
```
