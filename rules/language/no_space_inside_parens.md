---
id: no_space_inside_parens
title: No spaces inside parentheses
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Do not put spaces just inside parentheses: `DoProc("Name", {args})`, not
  `DoProc( "Name", {args} )`.
categories: [formatting]
enforced_by: [reviewer]
schema:
  - path: formatting.spaces.inside_parens
    form: value
    value: false
verification:
  basis: convention
  note: >-
    Kept from the format skill ("No space inside parentheses") and the
    refactoring guide's spacing table, whose example is kept. The schema's
    formatting.spaces.inside_parens says the same. The formatter removes the
    spaces, but starlims-lsp has no catalog entry of its own for it.
---

## Rationale

Parentheses already delimit the argument list; spaces inside them only widen
the line.

## Examples

### Good

```ssl
:DECLARE nLength;

nLength := Len("abc");
```

### Bad

```ssl
:DECLARE nLength;
nLength := Len( "abc" );
```
