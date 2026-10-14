---
id: class_name_not_builtin
title: Do not name a class after a built-in class
domain: classes
status: active
level: advisory
severity: warning
applies_to: [class]
rule: >-
  Do not give a `:CLASS` the name of a built-in class such as `Email` or
  `SSLDataset`.
categories: [classes]
related_elements: [CLASS, Email, SSLDataset]
enforced_by: [lsp:diag.class_name_collision]
verification:
  basis: convention
  note: >-
    Merged from the new-class skill (stop when the proposed name collides with
    a built-in class) and the review skill's inventory check ("Flag any :CLASS
    Foo; declaration where Foo matches a built-in class name").
---

## Rationale

A class named like a built-in confuses readers, who reach for `Email{}` and
get the wrong one.

## Examples

### Good

```ssl
:CLASS ResultMailer;
:DECLARE sTo;

:PROCEDURE SetRecipient;
	:PARAMETERS sAddress;

	Me:sTo := sAddress;
:ENDPROC;
```

### Bad

```ssl
:CLASS Email;
:DECLARE sTo;

:PROCEDURE SetRecipient;
	:PARAMETERS sAddress;
	Me:sTo := sAddress;
:ENDPROC;
```
