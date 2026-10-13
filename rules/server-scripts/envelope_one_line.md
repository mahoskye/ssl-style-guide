---
id: envelope_one_line
title: A short envelope stays on one line
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Keep a variable-only envelope such as `{.F., {sCode, sMessage}}` on one
  physical line when it fits.
categories: [formatting]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Validation And Boundary
    Contracts"). It also says to split an envelope when inline literal text,
    more payload fields or the line-length limit benefit from clearer
    grouping.
---

## Rationale

A short envelope is easier to read as one value than spread over several
lines.

## Exceptions

Split an envelope when inline literal text, more payload fields or the
line-length limit benefit from clearer grouping.

## Examples

### Good

```ssl
:PROCEDURE Fail;
	:PARAMETERS sCode, sMessage;
	:RETURN {.F., {sCode, sMessage}};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Fail;
	:PARAMETERS sCode, sMessage;
	:RETURN {
		.F.,
		{sCode, sMessage}
	};
:ENDPROC;
```
