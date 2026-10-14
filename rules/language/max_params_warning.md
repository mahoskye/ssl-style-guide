---
id: max_params_warning
title: Keep parameter lists short
domain: language
status: active
level: advisory
severity: info
applies_to: [server_script, class]
rule: >-
  Keep procedures to at most 8 parameters; more than 20 parameters on a
  procedure or method draws a warning, so group related state into arrays or
  objects.
categories: [procedures]
related_elements: [PARAMETERS]
enforced_by: [lsp:diag.max_params_warning]
schema:
  - path: lints.class_rules.max_params_warning.message
    form: text
    message: Procedures with more than 20 parameters generate a warning.
  - path: lints.style_rules.max_params_per_procedure
    form: value
    value: 8
verification:
  basis: convention
  note: >-
    Merged from the schema's lints.style_rules.max_params_per_procedure ("style
    recommendation; STARLIMS warns at 20") and lints.class_rules
    max_params_warning, whose message stays word for word, and the agent
    guide's procedures section ("prefer grouping related state into
    arrays/objects").
---

## Rationale

A long positional parameter list is easy to call in the wrong order. Past 20
parameters the platform itself warns.

## Examples

### Good

```ssl
:PROCEDURE SaveOrder;
	:PARAMETERS oOrder;

	:RETURN oOrder:orderNo;
:ENDPROC;
```

### Bad

```text
:PROCEDURE SaveOrder;
	:PARAMETERS sOrdNo, sCust, sSite, dLogged, nQty, nPrice, sUnit, sNote, bRush;
```
