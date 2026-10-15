---
id: format_for_composed_text
title: Compose text with sFmt:Format
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Declare `sFmt` with the other string locals and use `sFmt:Format(template,
  {value1, value2, ...})` for messages, paths, setting keys and other
  composed text.
categories: [strings]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Naming And Formatting"); the
    second sentence of that bullet is format_arg_not_array. The baseline's
    scope note explains that any string value has :Format through .NET
    member passthrough.
---

## Rationale

A template shows the finished text in one piece, where a chain of
concatenations hides it between the quotes.

## Examples

### Good

```ssl
:PROCEDURE Describe;
	:PARAMETERS sOrdNo, nCount;
	:DECLARE sFmt, sMessage;

	sFmt := "";
	sMessage := sFmt:Format("Order {0} has {1} tests", {sOrdNo, nCount});

	:RETURN sMessage;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Describe;
	:PARAMETERS sOrdNo, nCount;
	:DECLARE sMessage;
	sMessage := "Order " + sOrdNo + " has " + LimsString(nCount) + " tests";
	:RETURN sMessage;
:ENDPROC;
```
