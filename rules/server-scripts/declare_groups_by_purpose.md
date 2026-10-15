---
id: declare_groups_by_purpose
title: Group declarations by purpose
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Separate local variables with distinct responsibilities or lifecycles into
  purpose-based `:DECLARE` groups, such as request construction,
  configuration, retry state, response processing, transaction state and
  diagnostics.
categories: [procedures]
related_elements: [DECLARE]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Naming And Formatting"), which
    asks to identify the responsibilities actively and names these example
    concerns.
---

## Rationale

A group per concern shows what state a procedure keeps and where each piece
belongs.

## Examples

### Good

```ssl
:PROCEDURE SendRequest;
	:PARAMETERS sUrl;
	:DECLARE nRetry, nRetryLimit;
	:DECLARE oErr, sDiag;

	nRetry := 0;
	nRetryLimit := 3;
	sDiag := "";
	oErr := NIL;

	:RETURN {sUrl, nRetry, nRetryLimit, oErr, sDiag};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE SendRequest;
	:PARAMETERS sUrl;
	:DECLARE nRetry, oErr, sDiag, nRetryLimit;

	nRetry := 0;
	nRetryLimit := 3;
	sDiag := "";
	oErr := NIL;
	:RETURN {sUrl, nRetry, nRetryLimit, oErr, sDiag};
:ENDPROC;
```
