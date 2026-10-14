---
id: prefer_explicit_trim_concat
title: Write Trim() and + instead of string minus
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Join strings with `Trim(sFirst) + sSecond`, not `sFirst - sSecond`: on
  strings, `-` trims trailing spaces from the left operand and then appends,
  which reads like subtraction.
categories: [operators, strings]
related_elements: [minus, plus, Trim]
enforced_by: [reviewer]
verification:
  basis: observed
  note: >-
    Verified on STARLIMS 12 and documented on the language reference's -
    operator page: with two strings, - removes trailing space characters
    from the left operand only and then appends the right operand, and a
    trailing tab is kept. The Trim page documents that Trim removes
    trailing tabs, line breaks and other whitespace, not just spaces.
    Approved as a style rule. starlims-lsp v0.27.0 has no diagnostic for
    it, so enforced_by stays reviewer. LSP enforcement is requested.
---

## Rationale

With two strings, `-` removes trailing space characters from the left
operand and then appends the right operand: `"Sample   " - "Analysis"` is
`"SampleAnalysis"`. Nothing is subtracted, but the expression reads like
arithmetic, and a reader who does not know this behavior misreads it.
`Trim(sFirst) + sSecond` says what happens.

## Exceptions

The two forms differ when the left value ends in whitespace other than a
space. `Trim()` removes all trailing whitespace, including tabs and line
breaks, while `-` removes only spaces, so `"Lot" + Chr(9) - "A"` keeps the
tab and `Trim("Lot" + Chr(9)) + "A"` does not. When a value can end in a
tab or line break and that character must be kept, keep the `-` and say so
in a comment.

## Examples

### Good

```ssl
:DECLARE sFirst, sSecond, sResult;

sFirst := "Sample   ";
sSecond := "Analysis";

sResult := Trim(sFirst) + sSecond;
```

### Bad

```ssl
:DECLARE sFirst, sSecond, sResult;

sFirst := "Sample   ";
sSecond := "Analysis";

sResult := sFirst - sSecond;
```
