---
id: procedure_doc_block_required
title: Document every nontrivial procedure
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Document every nontrivial local procedure with a doc block that states its
  purpose, its parameters, and what it returns.
categories: [procedures]
enforced_by: [reviewer]
schema:
  - path: documentation.procedure_headers.required
    form: value
    value: true
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Document every nontrivial local
    procedure with this structure"). Merged: the schema's
    documentation.procedure_headers.required, the quality bar ("every
    procedure carries a doc block stating purpose, parameters, and what the
    caller receives"), and the review rubric (a nontrivial procedure with no
    doc block is a warning).
---

## Rationale

A procedure's caller needs its contract without reading its body: what it
is for, what each parameter means, and what it gives back on success and on
failure.

## Examples

### Good

```ssl
/*
 * Procedure: BuildRequest
 * Description: Validates the request and prepares the operation state.
 * Parameters:
 *   sRequestId - Operation request identifier
 * Returns: aResult - {.T., operation state} or failure envelope
;
:PROCEDURE BuildRequest;
	:PARAMETERS sRequestId;

	:RETURN ExecFunction("Requests.Prepare", {sRequestId});
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE BuildRequest;
	:PARAMETERS sRequestId;
	:RETURN ExecFunction("Requests.Prepare", {sRequestId});
:ENDPROC;
```

## Notes

Three header layouts are in use: the server-script baseline's
`* Procedure:` block (shown above), the schema's dot-leader
`procedure_headers.template`, and the new-procedure skill's `PROCEDURE:` /
`PURPOSE:` lines. This record requires a doc block; it does not choose
between the layouts.
