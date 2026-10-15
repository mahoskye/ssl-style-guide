---
id: no_excess_blank_lines
title: No runs of blank lines
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Do not leave three or more consecutive blank lines; reduce such a run to
  two.
categories: [formatting]
enforced_by: [lsp:fmt.max_consecutive_blank_lines]
schema:
  - path: formatting.blank_lines.max_consecutive
    form: value
    value: 2
verification:
  basis: convention
  note: >-
    The format skill said a run of three or more becomes one. #125 set the
    cap at two, so an author's double blank line is kept. starlims-lsp
    v0.26.0 caps runs at two by default (ssl.format.maxConsecutiveBlankLines;
    earlier releases left runs alone unless the setting was configured).
issues: ["#125"]
---

## Rationale

A run of blank lines suggests a missing piece of code and pushes the rest of
the logic off the screen. One or two blank lines are an author's grouping and
stay.

## Examples

### Good

```ssl
:DECLARE nCount;

nCount := 0;


nCount := nCount + 1;
```

### Bad

```ssl
:DECLARE nCount;

nCount := 0;




nCount := nCount + 1;
```
