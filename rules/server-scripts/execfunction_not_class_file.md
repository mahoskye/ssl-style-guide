---
id: execfunction_not_class_file
title: ExecFunction never targets a class file
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Point `ExecFunction` at a script entry point or script procedure, never at
  a class file; create class instances with `CreateUdObject` and call their
  methods.
categories: [procedures, classes]
related_elements: [ExecFunction, CreateUdObject]
enforced_by: [reviewer]
verification:
  basis: observed
  note: >-
    From the quality bar ("an ExecFunction root is a verified script entry
    point, never a class file") and the review rubric, which lists an
    ExecFunction to a class file as an error. A class file has no script entry
    point, so the call fails at run time. starlims-lsp reports it as
    execfunction_class_target only when a workspace index is available, so the
    command-line check cannot enforce it.
---

## Rationale

A class file defines a class, not a script. It has no top-level code to run,
so `ExecFunction` on it fails when it runs. Instantiate the class with
`CreateUdObject("Category.ClassName")` and call the method on the instance.

## Examples

### Good

```ssl
:PROCEDURE CountSamples;
	:DECLARE oCounter;

	oCounter := CreateUdObject("Samples.Counter");
	oCounter:Increment();

	:RETURN oCounter:nCount;
:ENDPROC;
```

### Bad

```text
ExecFunction("Samples.Counter.Increment");
```

The bad call names a method of the class file `Samples.Counter`.
