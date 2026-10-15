---
id: global_assignment
title: Never assign to a global
domain: server-scripts
status: active
level: authoritative
severity: warning
applies_to: [server_script, class]
rule: >-
  Never assign to a global; nothing makes it read-only, and every routine
  that reads it afterwards sees your value.
categories: [procedures]
enforced_by: [lsp:diag.global_assignment]
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline's predefined-globals bullets, which
    state it word for word. The id is the starlims-lsp diagnostic slug.
---

## Rationale

A global is shared by everything that runs after the assignment, so changing
it changes their behavior too.

## Examples

### Good

```ssl
:PROCEDURE CurrentUser;
	:DECLARE sUser;

	sUser := MYUSERNAME;

	:RETURN sUser;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE ImpersonateUser;
	:PARAMETERS sUser;
	MYUSERNAME := sUser;
	:RETURN sUser;
:ENDPROC;
```
