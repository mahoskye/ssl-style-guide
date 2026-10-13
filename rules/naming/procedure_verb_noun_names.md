---
id: procedure_verb_noun_names
title: Procedure names are verb plus noun
domain: naming
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  Name procedures as a verb followed by a noun, for example `ValidateOrder`,
  `ProcessQCSample` or `CalculateTotal`.
categories: [naming]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the refactoring guide's procedure names ("Pattern: Verb +
    Noun") with its examples. Merged: its checklist item "Procedures use
    PascalCase verb+noun", whose casing half is procedure_class_pascal_case.
---

## Rationale

A verb and a noun say what the procedure does and to what, so a call reads as
an action.

## Examples

### Good

```ssl
:PROCEDURE CalculateTotal;
	:PARAMETERS nQty, nPrice;
	:RETURN nQty * nPrice;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Total;
	:PARAMETERS nQty, nPrice;
	:RETURN nQty * nPrice;
:ENDPROC;
```
