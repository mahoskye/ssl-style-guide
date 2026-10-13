---
id: default_after_parameters
title: ":DEFAULT immediately follows :PARAMETERS"
domain: server-scripts
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  `:DEFAULT` must immediately follow `:PARAMETERS`.
categories: [procedures]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [DEFAULT, PARAMETERS]
enforced_by: [lsp:diag.default_after_parameters]
schema:
  - path: lints.coding_standards
    form: lint
    message: >-
      :DEFAULT must immediately follow :PARAMETERS (zero or more :DEFAULT
      lines, but only after :PARAMETERS).
verification:
  basis: reference
  note: >-
    Kept from the procedures pack. The schema lint default_after_parameters
    says the same with a note on zero or more lines. Merged: the second half
    of the foundation bullet and the skills' rule lists.
---

## Rationale

`:DEFAULT` lines supply a value for a parameter the caller left out. They are
only accepted directly after `:PARAMETERS`; zero or more may follow it, but no
other statement may come between.

## Examples

### Good

```ssl
:PROCEDURE LoadSample;
	:PARAMETERS sSampleId, nMaxRows;
	:DEFAULT sSampleId, "";
	:DEFAULT nMaxRows, 100;
	:DECLARE sStatus;

	sStatus := "";
	:RETURN sSampleId + sStatus + LimsString(nMaxRows);
:ENDPROC;
```

### Bad

```ssl
:PROCEDURE LoadSample;
	:PARAMETERS sSampleId, nMaxRows;
	:DECLARE sStatus;
	:DEFAULT nMaxRows, 100;

	sStatus := "";
	:RETURN sSampleId + sStatus + LimsString(nMaxRows);
:ENDPROC;
```
