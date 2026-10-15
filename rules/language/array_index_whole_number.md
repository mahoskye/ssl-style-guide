---
id: array_index_whole_number
title: An array index is a whole number
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Index an array with a whole number only: a fractional index raises at run
  time, and division gives a whole number only when it divides evenly, so
  wrap a computed index in `Integer()` or otherwise guarantee a whole number.
categories: [arrays]
machine: { list: must_follow }
related_elements: [Integer, divide, array]
enforced_by: [lsp:diag.array_index_whole_number]
verification:
  basis: observed
  note: >-
    Verified on STARLIMS 12: `a[2.5]` and `a[3 / 2]` raise at run time, while
    `a[4 / 2]` reads the second element. The language reference documents the
    behavior. starlims-lsp v0.27.0 reports a fractional literal index and an
    index computed with `/` as array_index_whole_number (error); it accepts
    `a[4 / 2]`, which divides evenly, and an index wrapped in Integer().
---

## Rationale

SSL has one numeric type, and `/` always divides exactly (`3 / 2` is `1.5`),
so an index computed by division is a fraction whenever the division does not
come out even. `aItems[2.5]` and `aItems[3 / 2]` raise at run time, while
`aItems[4 / 2]` works, so code that indexes with a quotient can pass its tests
and fail on the next input size. `Integer()` makes the index a whole number on
every input.

## Examples

### Good

```ssl
:DECLARE aItems, nMiddle, sMiddle;

aItems := {"A", "B", "C"};
nMiddle := Integer(ALen(aItems) / 2) + 1;
sMiddle := aItems[nMiddle];
```

### Bad

```ssl
:DECLARE aItems, sMiddle;
aItems := {"A", "B", "C"};
sMiddle := aItems[ALen(aItems) / 2];
```

With three items the index is `1.5`, which raises at run time.
