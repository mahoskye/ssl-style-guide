---
id: net_collections_zero_based
title: .NET collections are 0-based
domain: language
status: active
level: authoritative
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Index collections on .NET objects reached via colon member access (for
  example `dataSet:Tables[0]`) as 0-based.
categories: [arrays]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [SSLDataset, MakeNETObject]
enforced_by: [reviewer]
schema:
  - path: expressions.indexing.net_collections
    form: value
    value: zero_based
verification:
  basis: reference
  note: >-
    Kept from the arrays pack, which states it word for word. Merged: the
    second half of the foundation's array bullet, the agent guide's array
    indexing note, and the schema's expressions.indexing.net_collections and
    array_operations.net_interop_exception. starlims-lsp warns on any index 0
    reached through a colon, because it cannot always tell a .NET collection
    from an SSL array, so the examples are text.
---

## Rationale

A collection exposed by a .NET object keeps .NET semantics. Writing
`dataSet:Tables[1]` out of 1-based habit silently addresses the second table.

## Examples

### Good

```text
oTable := oDataSet:Tables[0];
```

### Bad

```text
oTable := oDataSet:Tables[1];
```

The bad line was meant to read the first table.
