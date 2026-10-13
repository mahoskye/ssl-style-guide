---
id: equals_vs_strict_equals
title: Use == for exact string comparison
domain: language
status: active
level: advisory
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use `==` for exact string equality; `=` is prefix-style for strings.
categories: [strings, operators]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [equals, strict-equals, not-equals]
enforced_by: [lsp:diag.equals_vs_strict_equals]
schema:
  - path: lints.type_safety
    form: lint
    message: >-
      For strings, = is loose equality (returns .T. if right is empty or if
      left starts with right) while == does exact matching. != negates ==
      (strict), not = (loose), so = and != are not logical opposites for
      strings. For other types, both delegate to the same comparison. Prefer
      == for string comparisons where exact match is needed.
verification:
  basis: reference
  note: >-
    Kept from the foundation bullet. Merged: the strings pack's "Use == for
    exact string equality.", "Remember that = is prefix-style for strings and
    is not the same as exact equality." and "Do not assume = and != are
    logical opposites for strings."; the operators pack's "Use == when exact
    string equality matters.", "Do not treat = as exact string equality." and
    "Do not assume != negates string prefix equality."; the skills' rule
    lists; the agent guide's quick start rule 9 and gotcha 18; and the schema
    lint, whose message stays word for word.
---

## Rationale

On strings, `=` is `.T.` when the right side is empty or the left side starts
with it, so `"Logged" = "Log"` is `.T.`. `!=` negates `==`, not `=`, so the
two are not opposites: `"Logged" != "Log"` is also `.T.`.

## Exceptions

A deliberate prefix test may use `=`. Say so in a comment.

## Examples

### Good

```ssl
:DECLARE sStatus, bDone;
sStatus := "Complete";
bDone := sStatus == "Complete";
```

### Bad

```ssl
:DECLARE sStatus, bDone;
sStatus := "Complete";
bDone := sStatus = "Complete";
```
