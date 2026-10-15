---
id: arrays_one_based
title: SSL arrays are 1-based
domain: language
status: active
level: authoritative
severity: error
applies_to: [server_script, class, ssl_data_source]
rule: >-
  SSL arrays are 1-based; loop over arrays from 1 through `ALen(aArray)`.
categories: [arrays, loops, types]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [ALen, FOR]
enforced_by: [lsp:diag.zero_based_array_index]
schema:
  - path: array_operations.one_based_indexing
    form: value
    value: true
  - path: expressions.indexing.arrays
    form: value
    value: one_based
verification:
  basis: reference
  note: >-
    Kept from the loops pack, which states it word for word. Merged: the
    arrays pack's "SSL arrays are 1-based." and "Do not treat SSL arrays as
    zero-based .NET arrays.", the loops pack's "Do not use zero-based indexes
    for SSL arrays." and "Do not assume .NET collection indexing rules apply
    to SSL arrays.", the types pack's "Do not confuse SSL arrays with .NET
    zero-based collections.", the first half of the foundation's array
    bullet, the agent guide's quick start rule 6 and gotcha 5, and the
    schema's indexing values.
---

## Rationale

The first element is `aItems[1]`, and index 0 is invalid. A loop from 0, or one
that stops at `ALen() - 1`, misses or overruns an element.

## Exceptions

Collections on .NET objects reached through colon member access are 0-based
(see `net_collections_zero_based`).

## Examples

### Good

```ssl
:PROCEDURE SumItems;
	:PARAMETERS aItems;
	:DECLARE i, nTotal;

	nTotal := 0;

	:FOR i := 1 :TO ALen(aItems);
		nTotal += aItems[i];
	:NEXT;

	:RETURN nTotal;
:ENDPROC;
```

### Bad

```ssl
:DECLARE aItems, nFirst;
aItems := {1, 2};
nFirst := aItems[0];
```
