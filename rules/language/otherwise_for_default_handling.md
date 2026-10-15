---
id: otherwise_for_default_handling
title: Include :OTHERWISE for default handling
domain: language
status: active
level: advisory
severity: hint
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Include `:OTHERWISE` for default handling; the language does not require
  it.
categories: [control-flow]
related_elements: [BEGINCASE, OTHERWISE]
enforced_by: [lsp:diag.missing_otherwise]
schema:
  - path: control_flow.style.case_style
    form: text
    message: include :OTHERWISE for default handling
verification:
  basis: convention
  note: >-
    Kept from the agent guide's case-block style guidance ("advisory — not
    required by the language") and the schema's control_flow.style.case_style.
---

## Rationale

An explicit `:OTHERWISE` shows that the unmatched case was considered, even
when it does nothing.

## Examples

### Good

```ssl
:DECLARE nCount, sLabel;

nCount := 0;

:BEGINCASE;
:CASE nCount == 0;
	sLabel := "none";
	:EXITCASE;
:OTHERWISE;
	sLabel := "some";
	:EXITCASE;
:ENDCASE;
```

### Bad

```ssl
:DECLARE nCount, sLabel;
nCount := 0;
:BEGINCASE;
:CASE nCount == 0;
	sLabel := "none";
	:EXITCASE;
:ENDCASE;
```
