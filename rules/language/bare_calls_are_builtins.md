---
id: bare_calls_are_builtins
title: A bare call is a built-in function call
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  A bare `Name(...)` call always means a built-in function, in scripts and
  classes alike; any other name stops the script from compiling with
  `Invalid built-in function: Name`.
categories: [procedures]
related_elements: [DoProc, ExecFunction]
enforced_by: [lsp:diag.direct_procedure_call]
schema:
  - path: function_calls.direct_calls.restrictions
    form: text
    message: Successful direct calls resolve to built-in functions
verification:
  basis: reference
  note: >-
    Kept from the agent guide's quick start rule 5. Merged: the schema's
    function_calls.direct_calls.restrictions entry "Successful direct calls
    resolve to built-in functions". The other half of rule 5, how to call a
    custom procedure, is no_direct_procedure_calls and the DoProc and
    ExecFunction records.
---

## Rationale

The name in a bare call is looked up among the built-in functions only. A
procedure in the same script is not found that way.

## Examples

### Good

```ssl
:DECLARE sName;
sName := AllTrim(" admin ");
```

### Bad

```ssl
:DECLARE n;
n := MyProc(1);
```
