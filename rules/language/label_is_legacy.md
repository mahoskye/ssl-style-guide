---
id: label_is_legacy
title: Prefer structured flow over :LABEL
domain: language
status: active
level: advisory
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Prefer structured constructs (`:IF`/`:WHILE`/`:FOR`) over legacy `:LABEL`
  and `Branch()` in new code.
categories: [control-flow]
related_elements: [LABEL, Branch]
enforced_by: [lsp:diag.deprecated_keyword]
schema:
  - path: lints.deprecated_keywords.:LABEL.message
    form: text
    message: >-
      :LABEL is legacy flow control (used with Branch()). Prefer structured
      constructs (:IF/:WHILE/:FOR) in new code.
verification:
  basis: convention
  note: >-
    Kept from the agent guide's labels section ("Prefer structured constructs
    in new and refactored code"). Merged: the schema's deprecated_keywords
    entry for :LABEL, whose message stays word for word.
---

## Rationale

A `Branch()` jump hides the flow of a procedure. Structured blocks show where
control goes.

## Examples

### Good

```ssl
:DECLARE nCount;

nCount := 0;

:IF nCount == 0;
	nCount := 1;
:ENDIF;
```

### Bad

```ssl
:DECLARE nCount;
nCount := 0;
Branch("LABEL SKIP");
nCount := 1;
:LABEL SKIP;
```
