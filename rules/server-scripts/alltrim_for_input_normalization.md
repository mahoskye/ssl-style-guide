---
id: alltrim_for_input_normalization
title: AllTrim to normalize input text
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Use `AllTrim` when normalizing caller input, route values, settings text
  or external response text; `Trim` strips trailing whitespace only.
categories: [strings]
related_elements: [AllTrim, Trim]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline ("Naming And Formatting"), which
    states it word for word, with its parenthesis made the second clause.
---

## Rationale

Text from outside the script can carry leading as well as trailing whitespace,
and `Trim` leaves the leading part in place.

## Examples

### Good

```ssl
:PROCEDURE RouteCode;
	:PARAMETERS sRoute;

	:RETURN AllTrim(sRoute);
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE RouteCode;
	:PARAMETERS sRoute;
	:RETURN Trim(sRoute);
:ENDPROC;
```
