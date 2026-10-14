---
id: declare_before_use
title: Declare variables before use
domain: language
status: active
level: advisory
severity: warning
applies_to: [server_script, class, ssl_data_source]
rule: >-
  Declare variables before use with `:DECLARE`.
categories: [procedures]
machine: { foundation: non_negotiable }
related_elements: [DECLARE]
enforced_by: [lsp:diag.undeclared_variable]
verification:
  basis: reference
  note: >-
    Kept from the foundation bullet, which states it word for word. The agent
    guide's quick start rule 3 explains that SSL does not enforce it: an
    undeclared name is looked up in caller scopes and publics, so declaring
    every name is the safe default rather than a language rule.
---

## Rationale

An undeclared name is looked up in the callers' scopes and then among the
public variables. A write to it can change a caller's variable, and a typo in
a read goes unnoticed.

## Exceptions

Predefined installation globals such as `CRLF` are read without a
declaration; declaring one hides it.

## Examples

### Good

```ssl
:DECLARE nCount, nTotal;

nCount := 1;
nTotal := nCount + 1;
```

### Bad

```ssl
:DECLARE nTotal;
nTotal := nCount + 1;
```
