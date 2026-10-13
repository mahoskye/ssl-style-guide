---
id: endregion_takes_no_name
title: endregion takes no name
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Close a comment region with `/* endregion;` alone; `endregion` takes no
  name, so never append one.
categories: [formatting]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the format skill ("endregion takes no name - never append
    one"). The schema's regions.comment_regions.pairing says the canonical
    closer is exactly "/* endregion;" and that any text after endregion is
    prose, never a name to match.
---

## Rationale

Regions pair last-opened-first-closed, so a name on the closer matches nothing
and only suggests a pairing that does not exist.

## Examples

### Good

```ssl
/* region Validation;
:PROCEDURE IsValid;
	:PARAMETERS sValue;
	:RETURN !Empty(sValue);
:ENDPROC;
/* endregion;
```

### Bad

```ssl
/* region Validation;
:PROCEDURE IsValid;
	:PARAMETERS sValue;
	:RETURN !Empty(sValue);
:ENDPROC;
/* endregion Validation;
```
