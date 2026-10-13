---
id: wrapped_list_alignment
title: Align the hanging lines of a wrapped list
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  When a declaration or similar comma-separated statement wraps, indent each
  hanging line so its first item aligns with the first item after the
  keyword.
categories: [formatting]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Naming And Formatting"), which
    states it word for word. The examples are text: starlims-lsp v0.24.0
    re-indents a wrapped :DECLARE to one continuation tab, so the formatter
    and this rule disagree.
---

## Rationale

Aligned items read as one list, and the hanging lines do not look like
statements of their own.

## Examples

### Good

```text
:DECLARE sRequestId, sRouteCode, sSettingKey, nRetryCount, nRetryLimit,
         bStarted, bCommit;
```

### Bad

```text
:DECLARE sRequestId, sRouteCode, sSettingKey, nRetryCount, nRetryLimit,
bStarted, bCommit;
```
