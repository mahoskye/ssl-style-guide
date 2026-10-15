---
id: keyword_uppercase
title: Keywords are uppercase and case-sensitive
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Colon-prefixed SSL keywords are uppercase and case-sensitive, for example
  `:IF` and `:BEGINCASE`.
categories: [control-flow]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [IF, BEGINCASE, PROCEDURE]
enforced_by: [lsp:diag.keyword_uppercase, lsp:fmt.keyword_case]
schema:
  - path: keywords.case
    form: value
    value: upper
  - path: language_features.case_sensitivity.keywords
    form: value
    value: uppercase_only
verification:
  basis: reference
  note: >-
    Kept from the foundation bullet ("Colon-prefixed SSL keywords are
    uppercase and case-sensitive."), with the control-flow pack's example
    (":IF and :BEGINCASE") merged in. Merged: the control-flow pack item "Use
    uppercase colon-prefixed keywords in SSL code", the skills' "Colon-prefixed
    keywords must be UPPERCASE", the agent guide's quick start rule 1 and
    gotcha 3, and the schema's keywords.case and
    language_features.case_sensitivity.keywords.
---

## Rationale

Keywords are matched by their exact uppercase spelling. A lowercase `:if` is
not the `:IF` keyword, so the block it was meant to open does not exist.
Identifiers and function names, by contrast, are case-insensitive.

## Examples

### Good

```ssl
:DECLARE nCount;

nCount := 0;

:IF nCount > 0;
	nCount := 1;
:ENDIF;
```

### Bad

```ssl
:DECLARE nCount;
nCount := 0;
:if nCount > 0;
	nCount := 1;
:endif;
```
