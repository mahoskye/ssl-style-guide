---
id: prefer_linear_success_path
title: A linear success path
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Prefer a linear success path over nested `:IF` chains.
categories: [control-flow]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's control-flow bullets, which state
    it word for word.
---

## Rationale

When each check returns on failure, the success path reads top to bottom at
one level, instead of at the bottom of a nest.

## Examples

### Good

```ssl
:PROCEDURE Validate;
	:PARAMETERS sOrdNo, sStatus;
	:IF Empty(sOrdNo);
		:RETURN .F.;
	:ENDIF;

	:IF Empty(sStatus);
		:RETURN .F.;
	:ENDIF;

	:RETURN .T.;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Validate;
	:PARAMETERS sOrdNo, sStatus;
	:DECLARE bOk;
	bOk := .F.;
	:IF !Empty(sOrdNo);
		:IF !Empty(sStatus);
			bOk := .T.;
		:ENDIF;
	:ENDIF;
	:RETURN bOk;
:ENDPROC;
```
