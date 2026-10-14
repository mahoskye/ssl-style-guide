---
id: branch_literal_target
title: Branch() targets are string literals
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Pass `Branch()` its target as a string literal. A computed target (a
  variable, parameter or expression) never jumps: it falls through to the next
  statement without an error, even when its text matches the label exactly.
categories: [control-flow]
related_elements: [LABEL, Branch]
enforced_by: [lsp:diag.branch_literal_target]
verification:
  basis: observed
  note: >-
    Checked on STARLIMS 12. A literal target is resolved when the code
    compiles, and one that matches no label fails to compile. A computed
    target never jumped, at script level or inside a procedure: variables,
    parameters, the bare label name, other casings, the joined form and a
    constant expression all fell through, while the same text as a literal
    reached the label. starlims-lsp v0.27.0 reports every non-literal target
    as branch_literal_target (error), including a constant expression.
---

## Rationale

A literal target is checked when the code compiles: a typo, or a target that
differs from the label in case, is a compile error instead of a silent
fall-through. A computed target never reaches a label at all: the call
falls through to the next statement, so the jump is silently lost. Where the
target depends on run-time data, choose among literal `Branch()` calls with
`:IF` or `:BEGINCASE`.

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
:DECLARE sTarget;

sTarget := "LABEL SKIP";
Branch(sTarget);
:LABEL SKIP;
```
