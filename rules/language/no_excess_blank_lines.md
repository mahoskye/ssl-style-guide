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
  one.
categories: [formatting]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the format skill ("Remove excessive consecutive blank lines
    (3+ becomes 1)"). starlims-lsp caps blank-line runs only when
    maxConsecutiveBlankLines is configured; its default leaves them, apart
    from the gap between procedures.
---

## Rationale

A run of blank lines suggests a missing piece of code and pushes the rest of
the logic off the screen.

## Examples

### Good

```ssl
:DECLARE nCount;
nCount := 0;

nCount := nCount + 1;
```

### Bad

```text
:DECLARE nCount;
nCount := 0;



nCount := nCount + 1;
```
