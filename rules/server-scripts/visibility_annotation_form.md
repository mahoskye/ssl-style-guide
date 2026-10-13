---
id: visibility_annotation_form
title: An access modifier sits immediately before :PROCEDURE
domain: server-scripts
status: active
level: authoritative
severity: warning
applies_to: [server_script]
rule: >-
  Put an access modifier on its own line immediately before `:PROCEDURE`,
  with no blank line between them.
categories: [procedures]
related_elements: [PROCEDURE]
enforced_by: [lsp:diag.visibility_annotation]
schema:
  - path: procedures.visibility_annotations.placement
    form: text
    message: >-
      own line immediately before :PROCEDURE, with no blank line between them
      (a blank line breaks the association)
verification:
  basis: reference
  note: >-
    Kept from the schema's procedures.visibility_annotations.placement.
    Merged: the review skill's "sit on the line immediately before
    :PROCEDURE (a blank line between them breaks the modifier)".
---

## Rationale

The modifier attaches to the `:PROCEDURE` that follows it directly. Separated
from it, it is an ordinary comment and the procedure stays callable from
other scripts.

## Examples

### Good

```ssl
/*@private;
:PROCEDURE RequireSample;
	:PARAMETERS sSampleId;

	:IF Empty(sSampleId);
		RaiseError("A sample is required");
	:ENDIF;
:ENDPROC;
```

### Bad

```ssl
/*@private;
:DECLARE sLastId;

:PROCEDURE RequireSample;
	:PARAMETERS sSampleId;

	sLastId := sSampleId;
	:IF Empty(sSampleId);
		RaiseError("A sample is required");
	:ENDIF;
:ENDPROC;
```

## Notes

starlims-lsp reports a modifier followed by a keyword other than
`:PROCEDURE`; it does not report a blank line between the modifier and
`:PROCEDURE`, so a reviewer checks that case.
