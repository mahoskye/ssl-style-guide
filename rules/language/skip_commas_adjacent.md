---
id: skip_commas_adjacent
title: Adjacent commas for skipped arguments
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Use adjacent commas with no spaces for skipped optional parameters.
categories: [arrays]
machine: { list: must_follow }
enforced_by: [lsp:diag.spaced_skip_commas]
schema:
  - path: lints.parameter_skipping_style.rule
    form: text
    message: >-
      House style: write skipped-argument commas adjacent with no intervening
      spaces — {param1,,param3}, not {param1, , param3}. Both forms are valid
      and behave the same.
verification:
  basis: convention
  note: >-
    Kept from the arrays pack, which states it word for word. Merged: the
    schema's lints.parameter_skipping_style.rule (word for word), the
    agent guide's calling-convention note and the format skill's spacing list.
---

## Rationale

An empty position passes `NIL`. Adjacent commas make the skipped position
obvious; a space between them looks like a missing argument.

## Examples

### Good

```ssl
:DECLARE aRows, sStatus;
sStatus := "Logged";
aRows := LSearch("SELECT ordno FROM orders WHERE status = ?",,, {sStatus});
```

### Bad

```ssl
:DECLARE aRows, sStatus;
sStatus := "Logged";
aRows := LSearch("SELECT ordno FROM orders WHERE status = ?", , , {sStatus});
```
