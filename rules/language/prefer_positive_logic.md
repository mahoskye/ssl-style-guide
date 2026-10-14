---
id: prefer_positive_logic
title: Prefer positive logic
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Prefer positive logic: when an `:IF` has an `:ELSE`, test the positive
  condition first.
categories: [control-flow]
related_elements: [IF, ELSE, not]
enforced_by: [lsp:diag.negative_logic]
schema:
  - path: lints.style_rules.prefer_positive_logic
    form: value
    value: true
verification:
  basis: convention
  note: >-
    From the schema's lints.style_rules.prefer_positive_logic, which has no
    rule text of its own; the wording describes what starlims-lsp's
    negative_logic reports.
---

## Rationale

A negated condition with an `:ELSE` makes the reader invert it twice. Swapping
the branches removes the negation.

## Examples

### Good

```ssl
:DECLARE bDone, nCount;

bDone := .F.;
nCount := 0;

:IF bDone;
	nCount := 2;
:ELSE;
	nCount := 1;
:ENDIF;
```

### Bad

```ssl
:DECLARE bDone, nCount;
bDone := .F.;
nCount := 0;
:IF .NOT. bDone;
	nCount := 1;
:ELSE;
	nCount := 2;
:ENDIF;
```
