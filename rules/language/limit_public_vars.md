---
id: limit_public_vars
title: Prefer :DECLARE over :PUBLIC
domain: language
status: active
level: advisory
severity: info
applies_to: [server_script, class]
rule: >-
  Prefer `:DECLARE` with parameter passing over `:PUBLIC` variables, which any
  procedure on the call stack can read or overwrite.
categories: [procedures]
related_elements: [PUBLIC, DECLARE]
enforced_by: [lsp:diag.limit_public_vars]
schema:
  - path: lints.coding_standards
    form: lint
    message: >-
      :PUBLIC variables are shared across the running program — any procedure
      can read or update them, including procedures called after the
      declaring procedure has returned — and anything on the call stack can
      overwrite them. Prefer :DECLARE with parameter passing.
  - path: lints.style_rules.disallow_globals
    form: value
    value: true
verification:
  basis: convention
  note: >-
    Kept from the schema lint limit_public_vars, shortened to its rule; its
    message stays word for word. Merged: lints.style_rules.disallow_globals.
---

## Rationale

A public variable outlives the procedure that declared it and is shared with
everything that runs after it, so any of that code can change it.

## Examples

### Good

```ssl
:PROCEDURE Total;
	:PARAMETERS nBase;
	:DECLARE nTotal;

	nTotal := nBase + 1;

	:RETURN nTotal;
:ENDPROC;
```

### Bad

```ssl
:PUBLIC nTotal;
nTotal := 0;
```
