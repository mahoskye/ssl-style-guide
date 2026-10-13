---
id: doc_block_parameter_alignment
title: Align doc-block parameters only when it helps
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Align parameter descriptions in a procedure doc block when it improves
  scanning, but do not force large spacing or fragile visual columns.
categories: [procedures]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Align parameter descriptions when
    it improves scanning, but do not force large spacing or fragile visual
    columns").
---

## Rationale

Aligned short names scan well. Columns padded to fit a long name push
descriptions far right and break on the next rename.

## Examples

### Good

```text
/*
 * Procedure: BuildRequest
 * Parameters:
 *   sRequestId - Operation request identifier
 *   sStatus    - Requested status
;
```

### Bad

```text
/*
 * Procedure: BuildRequest
 * Parameters:
 *   sRequestId                              - Operation request identifier
 *   sStatus                                 - Requested status
;
```
