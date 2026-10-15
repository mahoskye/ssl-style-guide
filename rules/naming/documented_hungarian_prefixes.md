---
id: documented_hungarian_prefixes
title: Use the documented type prefixes
domain: naming
status: active
level: style_only
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use documented prefixes: `s`, `n`, `b`, `d`, `a`, `o`, `fn`, and `v`.
categories: [naming]
machine: { list: must_follow }
related_elements: [DECLARE, PARAMETERS]
enforced_by: [reviewer]
schema:
  - path: lints.hungarian_notation.prefixes
    form: value
    value:
      s: string
      n: numeric
      b: boolean
      d: date
      a: array
      o: object
      fn: code_block
      v: variant
verification:
  basis: convention
  note: >-
    Kept from the naming pack, which states it word for word. Merged: its
    avoid item "Do not invent prefixes outside the documented set without a
    reason.", the skills' prefix lists, and the schema's
    lints.hungarian_notation.prefixes, which this record now supplies. `v`
    is for a variable whose type is unknown or changes.
---

## Rationale

A shared, small set of prefixes is what makes a prefix meaningful to every
reader and to the type checks that read it.

## Examples

### Good

```ssl
:DECLARE sName, nQty, bDone, dDue, aRows, oMail, fnRule, vResult;

sName := "";
nQty := 0;
bDone := .F.;
dDue := Today();
aRows := {};
oMail := Email{};
fnRule := {|x| x > 0};
vResult := NIL;
```

### Bad

```ssl
:DECLARE strName, intQty;
strName := "";
intQty := 0;
```
