---
id: no_default_on_declare_line
title: No :DEFAULT on a :DECLARE line
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Do not put `:DEFAULT` on a `:DECLARE` line.
categories: [procedures]
machine: { list: avoid, foundation: non_negotiable }
related_elements: [DECLARE, DEFAULT]
enforced_by: [lsp:diag.default_on_declare_line]
verification:
  basis: reference
  note: >-
    Kept from the procedures pack and the foundation, which state it word for
    word. The agent guide's quick start (rule 3) says the same.
---

## Rationale

`:DEFAULT` belongs to parameters, not to local variables. A local declared
with `:DECLARE` starts empty; assign it a value in a separate statement.

## Examples

### Good

```ssl
:PROCEDURE CountRows;
	:DECLARE nCount;

	nCount := 0;
	:RETURN nCount;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE CountRows;
	:DECLARE nCount :DEFAULT 0;

	:RETURN nCount;
:ENDPROC;
```
