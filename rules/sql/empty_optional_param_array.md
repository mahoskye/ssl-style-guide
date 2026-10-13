---
id: empty_optional_param_array
title: Omit a trailing empty optional array
domain: sql
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Do not pass empty trailing optional parameters when they can be omitted.
categories: [database]
machine: { list: avoid }
related_elements: [GetDataSet, DoProc, ExecFunction]
enforced_by: [lsp:diag.empty_optional_param_array]
schema:
  - path: lints.parameter_skipping_style.trailing_params
    form: text
    message: Omit trailing optional parameters rather than passing empty values.
verification:
  basis: convention
  note: >-
    Kept from the database pack's avoid list. starlims-lsp reports a trailing
    `{}` passed to GetDataSet, DoProc or ExecFunction. Merged: the schema's
    lints.parameter_skipping_style.trailing_params and the agent guide's
    calling-convention note ("Omit trailing optional parameters").
---

## Rationale

A trailing `{}` for an optional parameter changes nothing; the call works the
same without it. Leaving it out keeps the call short and makes a values array
that is actually passed stand out.

## Exceptions

An empty array followed by further arguments is a positional placeholder and
stays.

## Examples

### Good

```ssl
:DECLARE sXml;
sXml := GetDataSet("SELECT ordno FROM ordtask");
```

### Bad

```ssl
:DECLARE sXml;
sXml := GetDataSet("SELECT ordno FROM ordtask", {});
```
