---
id: exitcase_last_in_branch
title: :EXITCASE is the last statement of its branch
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `:EXITCASE` must be the last statement of its `:CASE`/`:OTHERWISE` branch,
  directly in the branch body; one nested inside `:IF`, or followed by another
  statement, is a compile error.
categories: [control-flow]
related_elements: [EXITCASE, CASE, OTHERWISE]
enforced_by: [reviewer]
schema:
  - path: blocks.case.exitcase_placement
    form: text
    message: >-
      last statement of its :CASE/:OTHERWISE branch, directly in the branch
      body — a statement after it, or :EXITCASE nested inside :IF, is a
      compile error
verification:
  basis: reference
  note: >-
    Kept from the review skill's rule list. Merged: the refactor skill
    ("never nest it inside an :IF"), the agent guide's case-block section and
    the schema's blocks.case.exitcase_placement. starlims-lsp v0.24.0 does not
    report either form, so the record is reviewer-enforced.
---

## Rationale

`:EXITCASE` leaves the case block from the end of a branch. It is not a
general jump, so it cannot sit inside a nested block or before more
statements in the same branch.

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
	:IF nCount == 0;
		:EXITCASE;
	:ENDIF;
	sLabel := "none";
:OTHERWISE;
	:EXITCASE;
	sLabel := "some";
:ENDCASE;
```
