---
id: format_arg_not_array
title: Format takes one array of values
domain: server-scripts
status: active
level: authoritative
severity: warning
applies_to: [server_script, class]
rule: >-
  Pass `sFmt:Format` one array holding every replacement value, including
  for a single placeholder.
categories: [strings]
enforced_by: [lsp:diag.format_arg_not_array]
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline ("The second argument is one array
    containing every replacement value, including for a single
    placeholder"). The id is the starlims-lsp diagnostic slug.
---

## Rationale

The replacement values travel as one array; a scalar in that position is not
spread into the placeholders.

## Examples

### Good

```ssl
:PROCEDURE Describe;
	:PARAMETERS sOrdNo;
	:DECLARE sFmt;
	sFmt := "";
	:RETURN sFmt:Format("Order {0}", {sOrdNo});
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Describe;
	:PARAMETERS sOrdNo;
	:DECLARE sFmt;
	sFmt := "";
	:RETURN sFmt:Format("Order {0}", sOrdNo);
:ENDPROC;
```
