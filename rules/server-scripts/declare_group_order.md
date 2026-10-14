---
id: declare_group_order
title: Order within a declaration group
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Within each purpose-based `:DECLARE` group, order variables by prefix,
  then name; keep a single group only when the locals genuinely share one
  cohesive purpose.
categories: [procedures]
related_elements: [DECLARE]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Naming And Formatting"), which
    states it word for word. The review rubric lists declaration order
    within a group as a suggestion.
---

## Rationale

A fixed order inside a group makes a missing or duplicate name easy to spot.

## Examples

### Good

```ssl
:PROCEDURE Describe;
	:PARAMETERS sName;
	:DECLARE nCount, sLabel, sText;

	nCount := Len(sName);
	sLabel := "Name";
	sText := sLabel + ": " + sName;

	:RETURN {nCount, sText};
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Describe;
	:PARAMETERS sName;
	:DECLARE sText, nCount, sLabel;

	nCount := Len(sName);
	sLabel := "Name";
	sText := sLabel + ": " + sName;
	:RETURN {nCount, sText};
:ENDPROC;
```
