---
id: prefer_exitcase
title: End each case branch with :EXITCASE
domain: language
status: active
level: style_only
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  End each `:CASE` / `:OTHERWISE` block with `:EXITCASE;` unless multi-match
  behavior is intentional.
categories: [control-flow]
machine: { list: must_follow }
related_elements: [BEGINCASE, CASE, OTHERWISE, EXITCASE]
enforced_by: [lsp:diag.prefer_exitcase]
schema:
  - path: lints.coding_standards
    form: lint
    message: >-
      :EXITCASE is syntactically optional, but without it later :CASE
      expressions are still evaluated and additional matching bodies may
      execute. :OTHERWISE still stays skipped once any earlier case body has
      run. Always include :EXITCASE unless multi-match behavior is
      intentional.
  - path: control_flow.style.exitcase_usage
    form: text
    message: end each :CASE/:OTHERWISE with :EXITCASE unless multi-match is intentional
verification:
  basis: reference
  note: >-
    Kept from the agent guide's style guidance rule 1 and the skills.
    Merged: the control-flow pack's "Terminate each :CASE and :OTHERWISE
    block with :EXITCASE unless deliberate fallthrough is required." and its
    avoid item "Do not rely on BEGINCASE fallthrough accidentally.", gotcha
    7, the schema lint prefer_exitcase and control_flow.style.exitcase_usage.
---

## Rationale

`:BEGINCASE` is not a value switch. Without `:EXITCASE`, later `:CASE`
conditions are still evaluated and more than one body can run, although
`:OTHERWISE` stays skipped once any case body has run.

## Exceptions

Leave `:EXITCASE` out only when several matching bodies are meant to run, and
say so in a comment.

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
:OTHERWISE;
	sLabel := "some";
	:EXITCASE;
:ENDCASE;
```
