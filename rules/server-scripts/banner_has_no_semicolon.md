---
id: banner_has_no_semicolon
title: No semicolon inside the banner
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  The banner is one comment, so it ends at the first `;`. Never put `;`
  anywhere inside it.
categories: [module-structure]
enforced_by: [lsp:diag.comment_text_after_terminator]
schema:
  - path: documentation.file_banner.rules
    form: text
    message: >-
      The banner is a single SSL comment, so it ends at the first semicolon.
      No semicolon may appear inside it.
verification:
  basis: reference
  note: >-
    Kept from the server-script baseline's banner bullets. The schema's
    documentation.file_banner.rules says the same in words.
---

## Rationale

An SSL comment runs from `/*` to the first `;`. A semicolon inside the
banner ends the comment there, and the rest of the banner is read as code.

## Examples

### Good

```ssl
/* ********************************************************************************
Description.. : Records a status change for one sample.
Returns...... : {.T., NIL} on success
Date......... : 2026-10-13
********************************************************************************;
:RETURN {.T., NIL};
```

### Bad

```ssl
/* ********************************************************************************
Description.. : Records a status change; for one sample.
Returns...... : {.T., NIL} on success
Date......... : 2026-10-13
********************************************************************************;
:RETURN {.T., NIL};
```
