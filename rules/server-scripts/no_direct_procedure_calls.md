---
id: no_direct_procedure_calls
title: No direct calls to custom procedures
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Do not call custom script procedures directly as `MyProc()`.
categories: [procedures]
machine: { list: avoid }
related_elements: [DoProc, ExecFunction]
enforced_by: [lsp:diag.direct_procedure_call]
schema:
  - path: function_calls.direct_calls.restrictions
    form: text
    message: Custom procedures must use DoProc/ExecFunction
verification:
  basis: reference
  note: >-
    Kept from the procedures pack. The schema's
    function_calls.direct_calls.restrictions, the agent guide (quick start
    rule 5 and "Calling Convention") and the review skill's "Bare procedure
    calls" check say the same.
---

## Rationale

A bare `Name(...)` call always means a built-in function. A name that is not
a built-in stops the script from compiling with
`Invalid built-in function: Name`, even when a procedure with that name is
declared in the same file.

## Examples

### Good

```ssl
:PROCEDURE Main;
	:PARAMETERS sSampleId;
	:RETURN DoProc("FormatId", {sSampleId});
:ENDPROC;

:PROCEDURE FormatId;
	:PARAMETERS sSampleId;
	:RETURN Upper(AllTrim(sSampleId));
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE Main;
	:PARAMETERS sSampleId;
	:RETURN FormatId(sSampleId);
:ENDPROC;

:PROCEDURE FormatId;
	:PARAMETERS sSampleId;
	:RETURN Upper(AllTrim(sSampleId));
:ENDPROC;
```
