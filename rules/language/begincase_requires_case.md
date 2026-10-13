---
id: begincase_requires_case
title: :BEGINCASE needs at least one :CASE
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `:BEGINCASE` requires at least one `:CASE` block.
categories: [control-flow]
machine: { list: must_follow }
related_elements: [BEGINCASE, CASE, ENDCASE]
enforced_by: [lsp:diag.begincase_requires_case]
schema:
  - path: blocks.case.constraint
    form: value
    value: at_least_one_case
verification:
  basis: reference
  note: >-
    Kept from the control-flow pack, which states it word for word. Merged:
    the review and refactor skills' rule lists and the schema's
    blocks.case.constraint.
---

## Rationale

An empty `:BEGINCASE; :ENDCASE;` block is rejected when the script compiles.

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
:DECLARE nCount;
nCount := 0;
:BEGINCASE;
:ENDCASE;
```
