---
id: code_block_comparison
title: Code blocks are not compared
domain: language
status: active
level: authoritative
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Do not compare code blocks with `=` or `==`; the comparison raises an
  error.
categories: [types, operators]
related_elements: [code-block, equals, strict-equals]
enforced_by: [lsp:diag.code_block_comparison]
schema:
  - path: lints.type_safety
    form: lint
    message: Code blocks (lambdas) cannot be compared with = or ==. This causes an error.
verification:
  basis: reference
  note: Kept from the schema lint code_block_comparison, whose message stays word for word.
---

## Rationale

A code block has no value to compare. Comparing two of them raises when the
expression runs.

## Examples

### Good

```ssl
:DECLARE fnDouble, nValue;
fnDouble := {|x| x * 2};
nValue := Eval(fnDouble, 4);
```

### Bad

```ssl
:DECLARE fnA, fnB, bSame;
fnA := {|x| x + 1};
fnB := {|x| x + 1};
bSame := fnA == fnB;
```
