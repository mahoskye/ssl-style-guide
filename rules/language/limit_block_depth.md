---
id: limit_block_depth
title: Limit block nesting to four levels
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Limit block nesting to 4 levels.
categories: [control-flow]
enforced_by: [lsp:diag.max_block_depth]
schema:
  - path: lints.style_rules.limit_block_depth
    form: value
    value: 4
verification:
  basis: convention
  note: From the schema's lints.style_rules.limit_block_depth, which has no rule text of its own.
---

## Rationale

Deeply nested blocks are hard to follow. Early returns or a helper procedure
flatten them.

## Examples

### Good

```ssl
:DECLARE n;

n := 0;

:IF n == 0;
	:IF n == 0;
		n := 1;
	:ENDIF;
:ENDIF;
```

### Bad

```ssl
:DECLARE n;
n := 0;
:IF n == 0;
	:IF n == 0;
		:IF n == 0;
			:IF n == 0;
				:IF n == 0;
					n := 1;
				:ENDIF;
			:ENDIF;
		:ENDIF;
	:ENDIF;
:ENDIF;
```
