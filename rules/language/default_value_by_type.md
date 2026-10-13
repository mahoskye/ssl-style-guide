---
id: default_value_by_type
title: Parameter defaults by type
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source, sql_data_source]
rule: >-
  Default a parameter to the empty value of its prefix type: `""` for
  strings, `0` for numbers, `.F.` for booleans, `{}` for arrays, and `NIL`
  for dates, objects, code blocks and variants.
categories: [procedures]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the new-procedure skill's default list and the new-datasource
    skill's "Default value by type", which agree.
---

## Rationale

A default of the parameter's own type keeps the prefix true for the value the
procedure actually receives, so code that tests or uses the value does not
meet an unexpected type.

## Examples

### Good

```ssl
:PROCEDURE Total;
	:PARAMETERS nQty, nPrice;
	:DEFAULT nQty, 0;
	:DEFAULT nPrice, 0;
	:RETURN nQty * nPrice;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Total;
	:PARAMETERS nQty, nPrice;
	:DEFAULT nQty, "";
	:DEFAULT nPrice, NIL;
	:RETURN nQty * nPrice;
:ENDPROC;
```
