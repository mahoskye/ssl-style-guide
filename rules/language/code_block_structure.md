---
id: code_block_structure
title: Code block literal shape
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Write a code block as `{|params| expression}`, with at least one parameter
  and a single-expression body.
categories: [types]
related_elements: [code-block, Eval]
enforced_by: [lsp:diag.code_block_structure]
schema:
  - path: expressions.code_block_literals.min_parameters
    form: value
    value: 1
  - path: expressions.code_block_literals.body
    form: value
    value: single_expression
verification:
  basis: reference
  note: >-
    Kept from the schema's expressions.code_block_literals and the
    types.codeblock note ("Literal syntax requires at least one parameter and
    a single-expression body"). Severity error: checked on STARLIMS 12, a
    code block with no bound variable does not compile.
---

## Rationale

A code block is one expression with its bound variables. It has no statement
list, and it needs at least one bound variable: a code block with none, such
as `{|| 1}`, does not compile.

## Examples

### Good

```ssl
:DECLARE fnDouble;

fnDouble := {|x| x * 2};
```

### Bad

```ssl
:DECLARE fnOne;
fnOne := {|| 1};
```
