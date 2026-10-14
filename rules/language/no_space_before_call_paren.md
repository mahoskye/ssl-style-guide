---
id: no_space_before_call_paren
title: No space before a call parenthesis
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Do not put a space between a function name and its `(`: `Len(sValue)`, not
  `Len (sValue)`.
categories: [formatting]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the format skill ("No space before ( in function calls") and
    the refactoring guide's spacing table, whose example is kept. The
    formatter removes the space, but starlims-lsp has no catalog entry of
    its own for it.
---

## Rationale

Keeping the parenthesis against the name marks the line as a call and matches
how the reference documents every function.

## Examples

### Good

```ssl
:DECLARE nLength;

nLength := Len("abc");
```

### Bad

```ssl
:DECLARE nLength;
nLength := Len ("abc");
```
