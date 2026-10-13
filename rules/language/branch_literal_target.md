---
id: branch_literal_target
title: Branch() targets are string literals
domain: language
status: active
level: advisory
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Pass `Branch()` its target as a string literal, not as a value computed at
  run time.
categories: [control-flow]
related_elements: [LABEL, Branch]
enforced_by: [reviewer]
verification:
  basis: observed
  note: >-
    Checked on STARLIMS 12. A literal target is resolved when the code
    compiles, and one that matches no label fails to compile. Inside a
    procedure, a computed target did not jump even when its text matched the
    label exactly, while the same text as a literal did. Whether a computed
    target ever matches is still open.
---

## Rationale

A literal target is checked when the code compiles: a typo, or a target that
differs from the label in case, is a compile error instead of a silent
fall-through. A target computed at run time is not checked, and inside a
procedure it has been seen to fall through to the next statement even when its
text matched the label exactly.

## Examples

### Good

```text
Branch("LABEL SKIP");
:LABEL SKIP;
```

Any `:LABEL` draws the legacy-keyword warning (see `label_is_legacy`), so both
forms are shown as text.

### Bad

```text
sTarget := "LABEL SKIP";
Branch(sTarget);
:LABEL SKIP;
```
