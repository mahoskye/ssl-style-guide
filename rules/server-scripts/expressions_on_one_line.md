---
id: expressions_on_one_line
title: Keep an expression on one line when it fits
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Keep calls, assignments, conditions and other expressions on one physical
  line when they fit and remain readable; wrap only when the established
  line-length limit requires it or the split exposes meaningful structure.
categories: [formatting]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Naming And Formatting"), which
    states it in two sentences, joined here.
---

## Rationale

An expression that fits on one line reads as one thing; breaking it without a
reason makes the reader rebuild it.

## Examples

### Good

```ssl
:DECLARE sMessage;
sMessage := "Loaded " + LimsString(3) + " rows";
```

### Bad

```ssl
:DECLARE sMessage;
sMessage := "Loaded "
	+ LimsString(3)
	+ " rows";
```
