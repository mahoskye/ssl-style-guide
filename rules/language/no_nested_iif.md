---
id: no_nested_iif
title: Do not nest IIf
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Do not nest `IIf` calls; use `:IF` or `:BEGINCASE` for more than two
  outcomes.
categories: [control-flow]
related_elements: [IIf, BEGINCASE]
enforced_by: [lsp:diag.nested_iif]
schema:
  - path: lints.style_rules.no_nested_ternaries
    form: value
    value: true
verification:
  basis: convention
  note: >-
    From the schema's lints.style_rules.no_nested_ternaries, which has no rule
    text of its own; the wording describes what starlims-lsp's nested_iif
    reports.
---

## Rationale

`IIf` evaluates every argument, and nesting it hides the order of the tests.
A case block states each outcome on its own line.

## Examples

### Good

```ssl
:DECLARE nCount, sLabel;
nCount := 0;
:BEGINCASE;
:CASE nCount > 1;
	sLabel := "many";
	:EXITCASE;
:CASE nCount == 1;
	sLabel := "one";
	:EXITCASE;
:OTHERWISE;
	sLabel := "none";
	:EXITCASE;
:ENDCASE;
```

### Bad

```ssl
:DECLARE nCount, sLabel;
nCount := 0;
sLabel := IIf(nCount > 1, "many", IIf(nCount == 1, "one", "none"));
```
