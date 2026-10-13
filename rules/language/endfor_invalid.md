---
id: endfor_invalid
title: A :FOR loop closes with :NEXT
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  `:ENDFOR`: a `:FOR` loop closes with `:NEXT`.
categories: [loops]
machine: { list: must_follow, foundation: does_not_have }
related_elements: [FOR, NEXT]
enforced_by: [lsp:diag.endfor_invalid]
schema:
  - path: blocks.for.end
    form: value
    value: ":NEXT"
verification:
  basis: reference
  note: >-
    Kept from the foundation's "SSL Does Not Have" list. Merged: the loops
    pack's "Use :NEXT to end :FOR loops; :ENDFOR is not a valid loop
    terminator.", gotcha 17, and the schema's blocks.for.end.
---

## Rationale

`:ENDFOR` is reserved but is not a usable keyword, and writing it is rejected
as a syntax error. `:NEXT` is the only closer of a `:FOR` loop.

## Examples

### Good

```ssl
:DECLARE i, nTotal;
nTotal := 0;
:FOR i := 1 :TO 3;
	nTotal += i;
:NEXT;
```

### Bad

```ssl
:DECLARE i, nTotal;
nTotal := 0;
:FOR i := 1 :TO 3;
	nTotal += i;
:ENDFOR;
```
