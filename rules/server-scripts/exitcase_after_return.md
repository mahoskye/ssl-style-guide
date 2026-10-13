---
id: exitcase_after_return
title: No :EXITCASE after a branch :RETURN
domain: server-scripts
status: active
level: style_only
severity: hint
applies_to: [server_script, class]
rule: >-
  Do not add `:EXITCASE;` after a branch-level `:RETURN`; the return already
  terminates the procedure.
categories: [control-flow]
enforced_by: [lsp:diag.exitcase_after_return]
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline's control-flow bullets, which state
    it word for word. The id is the starlims-lsp diagnostic slug.
---

## Rationale

The `:EXITCASE` can never run, and it suggests that the branch might continue.

## Examples

### Good

```ssl
:PROCEDURE RouteLabel;
	:PARAMETERS sRoute;
	:BEGINCASE;
	:CASE sRoute == "APPROVE";
		:RETURN "Approved";
	:OTHERWISE;
		:RETURN "Pending";
	:ENDCASE;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE RouteLabel;
	:PARAMETERS sRoute;
	:BEGINCASE;
	:CASE sRoute == "APPROVE";
		:RETURN "Approved";
		:EXITCASE;
	:OTHERWISE;
		:RETURN "Pending";
	:ENDCASE;
:ENDPROC;
```
