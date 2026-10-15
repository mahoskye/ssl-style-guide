---
id: prefer_unannotated_procedures
title: Prefer procedures without access modifiers
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script]
rule: >-
  Prefer procedures without `/*@private;` or `/*@protected;` annotations; the
  one required exception is a raise-only helper, which is marked
  `/*@private;`.
categories: [procedures]
related_elements: [PROCEDURE]
enforced_by: [lsp:diag.visibility_annotation_usage]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Naming And Formatting"). The
    starlims-lsp info-tier diagnostic visibility_annotation_usage reports
    every effective annotation, raise-only helpers included, so a reviewer
    confirms the exception.
---

## Rationale

An annotation blocks calls from other scripts. Most procedures do not need
that, and an unneeded one blocks a legitimate caller later. A raise-only
helper is the exception (see `private_raise_only_helpers`).

## Examples

### Good

```ssl
:PROCEDURE FormatId;
	:PARAMETERS sSampleId;

	:RETURN Upper(AllTrim(sSampleId));
:ENDPROC;
```

### Bad

```ssl
/*@private;
:PROCEDURE FormatId;
	:PARAMETERS sSampleId;
	:RETURN Upper(AllTrim(sSampleId));
:ENDPROC;
```
