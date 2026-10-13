---
id: log_caption_tags
title: Tag log captions
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Use `InfoMes` and `ErrorMes` for retained server-log diagnostics, and prefix
  captions with scan-friendly tags such as `[INFO]`, `[SUCCESS]`, or
  `[ERROR]`.
categories: [logging]
related_elements: [InfoMes, ErrorMes]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("External Calls And Error
    Handling").
---

## Rationale

A shared server log mixes output from many scripts. A fixed tag at the start
of each caption makes the entries easy to filter and scan.

## Examples

### Good

```ssl
:PROCEDURE Notify;
	:PARAMETERS sSampleId;

	InfoMes("[SUCCESS] Notify", "Owner notified for " + sSampleId);
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Notify;
	:PARAMETERS sSampleId;

	InfoMes("notify ok", sSampleId);
:ENDPROC;
```
