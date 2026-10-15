---
id: increment_as_statement
title: Use ++ and -- as statements of their own
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use `++` and `--` as a statement of their own (`nCount++;`), not inside a
  larger expression; never apply them to the same variable twice in one
  expression, or to a variable the same expression also reads.
categories: [operators]
related_elements: [increment, decrement, add-assign, subtract-assign]
enforced_by: [lsp:diag.increment_as_statement]
verification:
  basis: observed
  note: >-
    Verified on STARLIMS 12 and documented on the language reference's ++
    and -- operator pages: postfix returns the old value and prefix the new
    one, operands are evaluated left to right, and each ++ takes effect
    before the next operand is read, so with i = 1, `i++ + i++` returns 3
    and leaves i at 3. Approved as a style rule. Verified on STARLIMS 12;
    reported by starlims-lsp from v0.28.0, at info for an increment or
    decrement inside a larger expression and at warning when the same
    statement increments or reads that variable again.
---

## Rationale

`++` and `--` change the variable and also produce a value: postfix
(`nIndex++`) produces the value before the change and prefix (`++nIndex`)
the value after it. Inside a larger expression the reader has to work out
which value is used, and readers often get it wrong. Operands are evaluated
left to right and each `++` takes effect before the next operand is read,
so with `i = 1`, `i++ + i++` returns `3` (`1 + 2`) and leaves `i` at `3`.
As a statement of its own, `nCount++;` has one meaning: add one.

The rule has two tiers. An increment or decrement inside a larger
expression (`nNext := nCount++;`) is an info finding. Using the same
variable's `++` or `--` more than once in one expression, or incrementing a
variable that the same expression also reads (`aSeen[nIndex++] := nIndex;`),
is the case readers misjudge, and the LSP reports it as a warning
(`increment_as_statement` at warning severity instead of info).

## Examples

### Good

```ssl
:DECLARE aValues, nCount, nNext;

aValues := {10, 20, 30};
nCount := 1;

nNext := aValues[nCount];
nCount++;
```

### Bad

```ssl
:DECLARE aValues, nCount, nNext;

aValues := {10, 20, 30};
nCount := 1;

nNext := aValues[nCount++];
```

`nNext` gets `aValues[1]`, because postfix `++` produces the old value, and
`nCount` is `2` afterwards.

```ssl
:DECLARE aSeen, nIndex;

aSeen := {0, 0, 0};
nIndex := 1;

aSeen[nIndex++] := nIndex;
```

The same expression increments `nIndex` and reads it, so which element is
written and which value is stored depend on evaluation order. The LSP
reports this case as a warning.
