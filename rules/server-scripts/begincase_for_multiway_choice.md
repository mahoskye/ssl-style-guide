---
id: begincase_for_multiway_choice
title: :BEGINCASE for a choice among several
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Use `:BEGINCASE` when choosing among several routes, result shapes,
  artifact kinds, actions or outcomes.
categories: [control-flow]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline's control-flow bullets, which state
    it word for word.
---

## Rationale

A `:BEGINCASE` lists the choices side by side at one level, where a chain of
`:IF`/`:ELSE` nests a little deeper for each one.

## Examples

### Good

```ssl
:PROCEDURE RouteLabel;
	:PARAMETERS sRoute;
	:DECLARE sLabel;

	:BEGINCASE;
	:CASE sRoute == "APPROVE";
		sLabel := "Approved";
		:EXITCASE;
	:CASE sRoute == "REJECT";
		sLabel := "Rejected";
		:EXITCASE;
	:OTHERWISE;
		sLabel := "Pending";
		:EXITCASE;
	:ENDCASE;

	:RETURN sLabel;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE RouteLabel;
	:PARAMETERS sRoute;
	:DECLARE sLabel;
	:IF sRoute == "APPROVE";
		sLabel := "Approved";
	:ELSE;
		:IF sRoute == "REJECT";
			sLabel := "Rejected";
		:ELSE;
			sLabel := "Pending";
		:ENDIF;
	:ENDIF;
	:RETURN sLabel;
:ENDPROC;
```
