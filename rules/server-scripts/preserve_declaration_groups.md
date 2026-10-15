---
id: preserve_declaration_groups
title: Keep existing declaration groups
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Preserve intentional declaration groups when editing existing code; do not
  flatten semantic groups into one declaration or reorganize all variables
  solely by type or prefix.
categories: [procedures]
related_elements: [DECLARE]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Naming And Formatting"), which
    states it in two sentences, joined here.
---

## Rationale

The groups record which state belongs together. Flattening them throws that
away and turns a small edit into a large diff.

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
	:DECLARE nRetry, nRetryLimit, oErr, sDiag;

	nRetry := 0;
	nRetryLimit := 3;
	sDiag := "";
	oErr := NIL;
	:RETURN {sUrl, nRetry, nRetryLimit, oErr, sDiag};
:ENDPROC;
```
