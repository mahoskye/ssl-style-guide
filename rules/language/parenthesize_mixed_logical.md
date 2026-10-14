---
id: parenthesize_mixed_logical
title: Parenthesize an expression that mixes .AND. and .OR.
domain: language
status: active
level: style_only
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Parenthesize an expression that mixes `.AND.` and `.OR.`: `.AND.` binds
  tighter, so `bA .OR. bB .AND. bC` means `bA .OR. (bB .AND. bC)`.
categories: [operators]
machine: { list: must_follow }
related_elements: [and, or]
enforced_by: [reviewer]
verification:
  basis: observed
  note: >-
    Verified on STARLIMS 12 and documented on the language reference's
    .AND. and .OR. operator pages: .AND. groups before .OR., so
    `.T. .OR. .T. .AND. .F.` returns .T., and in `.T. .OR. X .AND. Y`
    neither X nor Y is evaluated. Approved as a style rule. starlims-lsp
    v0.27.0 has no diagnostic for it, so enforced_by stays reviewer. LSP
    enforcement at warning is requested.
---

## Rationale

`.AND.` binds tighter than `.OR.`, so `bA .OR. bB .AND. bC` is evaluated as
`bA .OR. (bB .AND. bC)`, whatever the line breaks suggest. Both operators
also skip their right operand once the result is known: in
`.T. .OR. X .AND. Y`, the whole `X .AND. Y` is the right operand of
`.OR.`, so neither `X` nor `Y` is evaluated. A reader who groups the
expression left to right expects `Y` to run and to decide the result.

Adding parentheses never changes what a correct expression does, and it
states which grouping was meant. Without them, a reader cannot tell a
deliberate grouping from a mistake.

## Examples

### Good

```ssl
:DECLARE bIsAdmin, bIsOwner, bIsActive, bCanEdit;

bIsAdmin := .F.;
bIsOwner := .T.;
bIsActive := .T.;

bCanEdit := bIsAdmin .OR. (bIsOwner .AND. bIsActive);
```

```ssl
:DECLARE bIsAdmin, bIsOwner, bIsActive, bCanEdit;

bIsAdmin := .F.;
bIsOwner := .T.;
bIsActive := .T.;

bCanEdit := (bIsAdmin .OR. bIsOwner) .AND. bIsActive;
```

### Bad

```ssl
:DECLARE bIsAdmin, bIsOwner, bIsActive, bCanEdit;

bIsAdmin := .T.;
bIsOwner := .F.;
bIsActive := .F.;

bCanEdit := bIsAdmin .OR. bIsOwner .AND. bIsActive;
```

This means `bIsAdmin .OR. (bIsOwner .AND. bIsActive)`: an inactive admin
can edit, and `bIsActive` is never read when `bIsAdmin` is `.T.`. If the
intent was `(bIsAdmin .OR. bIsOwner) .AND. bIsActive`, the result is wrong.
