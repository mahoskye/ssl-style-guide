---
id: class_ends_at_eof
title: A class ends at the end of the file
domain: classes
status: active
level: authoritative
severity: error
applies_to: [class]
rule: >-
  `:CLASS` continues to end of file; there is no `:ENDCLASS`.
categories: [classes]
related_elements: [CLASS]
enforced_by: [lsp:diag.endclass_invalid]
schema:
  - path: blocks.class.end
    form: value
    value: null
verification:
  basis: reference
  note: >-
    Kept from the new-class skill, which states it twice. Merged: the schema's
    blocks.class.end and the agent guide's class definition section.
    starlims-lsp reports :ENDCLASS as endclass_invalid, an error (from
    v0.25.0; earlier releases reported an unknown_keyword warning).
---

## Rationale

A class file holds exactly one class, so the end of the file ends the class.

## Examples

### Good

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Increment;
	Me:nCount += 1;
:ENDPROC;
```

### Bad

```ssl
:CLASS Counter;
:DECLARE nCount;

:PROCEDURE Increment;
	Me:nCount += 1;
:ENDPROC;
:ENDCLASS;
```
