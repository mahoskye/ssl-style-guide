---
id: parenthesize_negated_comparison
title: Parenthesize a negated comparison
domain: language
status: active
level: authoritative
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Write a negated comparison as `.NOT. (a = b)`: `.NOT.` binds before the
  comparison operators, so `.NOT. a = b` negates `a` alone.
categories: [operators]
machine: { list: must_follow }
related_elements: [not, equals, strict-equals, not-equals]
enforced_by: [lsp:diag.parenthesize_negated_comparison]
verification:
  basis: observed
  note: >-
    Verified on STARLIMS 12: `.NOT. s = "AB"` on a string raises "the
    operator/method: .NOT. is not implemented on type: SSLString", and on a
    logical operand the expression is evaluated as `(.NOT. b) = x`. The
    language reference documents the precedence. starlims-lsp v0.27.0
    reports it as parenthesize_negated_comparison: a warning, and an error
    when the negated operand is a string or number literal, which always
    raises.
---

## Rationale

`.NOT.` applies to the operand right after it, before any comparison is
evaluated. `.NOT. sCode = "AB"` therefore means `(.NOT. sCode) = "AB"`: on a
string, `.NOT.` raises at run time ("the operator/method: .NOT. is not
implemented on type: SSLString"), and on a logical it silently computes
`(.NOT. b) = x` instead of the negated comparison. Parentheses make the
expression mean what it says.

`!=` and `#` compare exactly, like `==`, so `sCode != "AB"` is the same as
`.NOT. (sCode == "AB")`. Neither is a drop-in replacement for
`.NOT. (sCode = "AB")`, which negates `=`'s prefix match.

## Examples

### Good

```ssl
:DECLARE sCode, bOtherPrefix, bOtherCode;

sCode := "ABC";

/* Deliberate prefix test, .T. unless sCode starts with AB;
bOtherPrefix := .NOT. (sCode = "AB");
bOtherCode := .NOT. (sCode == "AB");
```

### Bad

```ssl
:DECLARE sCode, bOtherPrefix;
sCode := "ABC";
bOtherPrefix := .NOT. sCode = "AB";
```

The bad line raises at run time: `.NOT.` is applied to the string `sCode`.

```ssl
:DECLARE sCodes, bMissing;

sCodes := "ABC";
bMissing := .NOT. "X" $ sCodes;
```

`.NOT.` is applied to the literal `"X"`, which always raises, so this one is
reported as an error. Write `.NOT. ("X" $ sCodes)`.
