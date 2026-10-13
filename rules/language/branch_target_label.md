---
id: branch_target_label
title: Branch() targets include the word LABEL
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Include the word `LABEL` in a `Branch()` target: `:LABEL SKIP;` is
  targeted as `Branch("LABEL SKIP")`, and the match is exact.
categories: [control-flow]
related_elements: [LABEL, Branch]
enforced_by: [lsp:diag.branch_target_label]
schema:
  - path: lints.label_behavior.token_text
    form: text
    message: >-
      The token text includes the word LABEL — :LABEL SKIP; produces "LABEL
      SKIP". Branch() targets must include "LABEL" in the string.
verification:
  basis: reference
  note: >-
    Kept from the agent guide's labels section. Merged: the schema's
    lints.label_behavior.token_text, which stays word for word.
---

## Rationale

The stored label text includes the keyword, so a target without `LABEL`, or
with different spacing, matches no label.

## Examples

### Good

```text
Branch("LABEL SKIP");
:LABEL SKIP;
```

Any `:LABEL` draws the legacy-keyword warning (see `label_is_legacy`), so the
good form is shown as text.

### Bad

```ssl
:DECLARE nCount;
nCount := 0;
Branch("SKIP");
:LABEL SKIP;
nCount := 1;
```
