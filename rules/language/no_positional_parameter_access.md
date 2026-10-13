---
id: no_positional_parameter_access
title: Parameters are accessed by name
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Positional parameter access (`$1`, `$2`, ...): parameters are accessed only
  by the names declared in `:PARAMETERS`.
categories: [procedures]
machine: { foundation: does_not_have }
related_elements: [PARAMETERS]
enforced_by: [reviewer]
verification:
  basis: reference
  note: >-
    Kept from the foundation's "SSL Does Not Have" list, which states it word
    for word. `$` is the containment operator, so `$1` is reported only as a
    generic syntax error.
---

## Rationale

SSL has no argument list to index. Each parameter is a named variable from the
`:PARAMETERS` line.

## Examples

### Good

```ssl
:PROCEDURE Greet;
	:PARAMETERS sName;
	:RETURN "Hello " + sName;
:ENDPROC;
```

### Bad

```text
:PROCEDURE Greet;
	:PARAMETERS sName;
	:RETURN "Hello " + $1;
:ENDPROC;
```
