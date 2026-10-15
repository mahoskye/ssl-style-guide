---
id: one_assignment_per_statement
title: One assignment per statement
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Prefer one assignment per line; use a chained assignment only when every
  target should receive the same value, and do not use an assignment inside
  a larger expression.
categories: [operators]
related_elements: [assignment]
enforced_by: [lsp:diag.one_assignment_per_statement]
schema:
  - path: expressions.assignment_semantics.style
    form: text
    message: Prefer one assignment per line; use a chained assignment only when every target should receive the same value
verification:
  basis: convention
  note: >-
    Kept from the schema's expressions.assignment_semantics.style, which
    states it word for word. The agent guide's operators summary says the
    same. An assignment is an expression that evaluates to the assigned
    value, so a chained assignment is valid; verified on STARLIMS 12 and
    documented on the language reference's := operator page. The clause
    about an assignment inside a larger expression was approved as a style
    rule. Verified on STARLIMS 12; reported by starlims-lsp from v0.28.0,
    at info, for an assignment whose value a larger expression uses. A
    pure chain does not count. A top-level := that is a whole :IF, :WHILE
    or :CASE condition is assignment_in_condition's (warning), not this
    record's, so that code is not cited in enforced_by.
---

## Rationale

Assignment is right-associative and evaluates to the assigned value, so
`sStatus := sDefault := "PENDING";` is valid. A pure chain like that, where
every target receives the same value, is the one accepted form.

The reported case is an assignment used inside a larger expression, such as
`nTotal := (nCount := 5) * 2;` or an assignment passed as a call argument.
The second assignment hides inside the first, and a reader scanning for
where `nCount` changes does not see it. Write it as its own statement.

An assignment that is the whole `:IF`, `:WHILE` or `:CASE` condition is
usually a typo for `=` or `==`. Tools report that case separately, as a
warning (`assignment_in_condition`), and not under this rule. An assignment
inside a larger condition, such as `:WHILE (nIndex += 1) <= nLast;`, is
this rule's case.

## Examples

### Good

```ssl
:DECLARE sStatus, sDefault;

sStatus := sDefault := "PENDING";
```

```ssl
:DECLARE nCount, nTotal;

nCount := 5;
nTotal := nCount * 2;
```

### Bad

```ssl
:DECLARE nCount, nTotal;
nTotal := (nCount := 5) * 2;
```
