---
id: parameters_first
title: ":PARAMETERS comes before any other statement"
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  `:PARAMETERS` must appear before any other statements in a script or
  procedure body.
categories: [procedures, module-structure]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [PARAMETERS, PROCEDURE]
enforced_by: [lsp:diag.parameters_first]
schema:
  - path: lints.coding_standards
    form: lint
verification:
  basis: reference
  note: >-
    Kept from the procedures pack and the schema lint parameters_first, which
    state it word for word. Merged: the module-structure pack's "Do not move
    :PARAMETERS after other statements", the first half of the foundation
    bullet, and the skills' ":PARAMETERS must come immediately after
    :PROCEDURE".
---

## Rationale

A script or procedure receives its arguments through `:PARAMETERS`. Any
statement before it, including `:DECLARE`, is rejected, so the parameter list
is always the first statement after `:PROCEDURE` or at the top of a script.

## Examples

### Good

```ssl
:PROCEDURE LoadSample;
	:PARAMETERS sSampleId;
	:DECLARE sStatus;

	sStatus := "";

	:RETURN sSampleId + sStatus;
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE LoadSample;
	:DECLARE sStatus;
	:PARAMETERS sSampleId;

	sStatus := "";
	:RETURN sSampleId + sStatus;
:ENDPROC;
```
