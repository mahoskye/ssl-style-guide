---
id: limstypeex_numeric_not_number
title: LimsTypeEx returns "NUMERIC", never "NUMBER"
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Check numeric values against `"NUMERIC"` only; `LimsTypeEx` never returns
  `"NUMBER"`.
categories: [types]
related_elements: [LimsTypeEx]
enforced_by: [lsp:diag.invalid_limstypeex_comparison]
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline ("Check numeric values against
    "NUMERIC" only. Do not use or accept "NUMBER" as a LimsTypeEx result.")
    and its LimsTypeEx table. The agent guide's "Public Type Names" section
    lists the same results.
---

## Rationale

`LimsTypeEx` returns `NIL`, `STRING`, `NUMERIC`, `LOGIC`, `DATE`, `ARRAY`,
`CODEBLOCK`, `OBJECT` or `SSLVALUE`. A comparison with `"NUMBER"` is never
true, so the check it guards never runs.

## Examples

### Good

```ssl
:PROCEDURE IsCount;
	:PARAMETERS vValue;

	:RETURN LimsTypeEx(vValue) == "NUMERIC";
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE IsCount;
	:PARAMETERS vValue;
	:RETURN LimsTypeEx(vValue) == "NUMBER";
:ENDPROC;
```
