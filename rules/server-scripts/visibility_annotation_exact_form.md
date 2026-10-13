---
id: visibility_annotation_exact_form
title: Access modifiers are written exactly
domain: server-scripts
status: active
level: authoritative
severity: warning
applies_to: [server_script]
rule: >-
  Write an access modifier exactly as `/*@private;` or `/*@protected;`:
  lowercase, with no space between `/*` and `@`.
categories: [procedures]
related_elements: [PROCEDURE]
enforced_by: [reviewer]
schema:
  - path: procedures.visibility_annotations.exact_form
    form: text
    message: >-
      Lowercase, with no space between /* and @ — /*@Private; or /* @private;
      is not recognized
verification:
  basis: reference
  note: >-
    Kept from the schema's procedures.visibility_annotations.exact_form.
    Merged: the review skill's "they must be lowercase, have no space after
    /*". starlims-lsp ignores the spaced form and matches the content without
    regard to case, so it does not report either variant.
---

## Rationale

Any other spelling is an ordinary comment. The procedure stays public, and
nothing reports that the modifier did not apply.

## Examples

### Good

```ssl
/*@protected;
:PROCEDURE RecountSamples;
	:RETURN ExecFunction("Samples.Recount");
:ENDPROC;
```

### Bad

```ssl
/* @Protected;
:PROCEDURE RecountSamples;
	:RETURN ExecFunction("Samples.Recount");
:ENDPROC;
```
