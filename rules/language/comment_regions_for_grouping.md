---
id: comment_regions_for_grouping
title: Comment regions for editor grouping
domain: language
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Use `/* region` / `/* endregion` comments for editor grouping instead of
  `:REGION` / `:ENDREGION`.
categories: [formatting]
machine: { list: must_follow }
related_elements: [REGION, ENDREGION, code-organization]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the agent guide's style guidance rule 3. Merged: the formatting
    pack's "Prefer /* region ...; and /* endregion; comments for editor
    grouping." and its avoid item "Do not use :REGION/:ENDREGION for code
    organization.", and gotcha 22.
---

## Rationale

`:REGION` is a working construct: it stores its body as text for
`GetRegion()`. Code placed inside it is not run as code. Comment regions only
fold in the editor.

## Examples

### Good

```ssl
/* region Validation Helpers;
:PROCEDURE CheckName;
	:PARAMETERS sName;
	:RETURN !Empty(sName);
:ENDPROC;
/* endregion;
```

### Bad

```text
:REGION Validation Helpers;
:PROCEDURE CheckName;
	:PARAMETERS sName;
	:RETURN !Empty(sName);
:ENDPROC;
:ENDREGION;
```
