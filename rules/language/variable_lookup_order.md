---
id: variable_lookup_order
title: Variable lookup order
domain: language
status: active
level: authoritative
severity: info
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Variable lookup: local scope → caller scopes (up call stack) → public
  variables (`:PUBLIC`).
categories: [procedures]
related_elements: [DECLARE, PUBLIC]
enforced_by: [reviewer]
schema:
  - path: lints.variable_behavior.rules.variable_lookup_order.message
    form: text
    message: "Variable lookup: local scope → caller scopes (up call stack) → public variables (:PUBLIC)."
verification:
  basis: reference
  note: >-
    Kept from the schema's lints.variable_behavior entry, which states it word
    for word. The agent guide's declaration section says the same. starlims-lsp
    has no entry for it.
---

## Rationale

A name that is not local is found in a caller's scope before the publics, so a
procedure can read or change its caller's variable by accident.

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

```text
:PROCEDURE Total;
	nTotal := nBase + 1;
	:RETURN nTotal;
:ENDPROC;
```

The bad procedure reads `nBase` and writes `nTotal` in whichever caller
declared them.
