---
id: document_real_outcomes_only
title: Document only outcomes the code produces
domain: server-scripts
status: active
level: style_only
severity: info
applies_to: [server_script, class]
rule: >-
  In a banner or doc block, describe a failure result or an empty case only
  when the code produces one; do not add outcomes to fill the template.
categories: [simplicity, formatting]
machine: { list: must_follow }
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    From the design philosophy (agent-guides/ssl_design_philosophy.md) and
    program decision 0002. Replaces the quality bar's earlier instruction to
    state the success, failure and empty case for every procedure.
---

## Rationale

The doc block is the contract a maintainer trusts without reading the body. A
failure result it promises but the code never returns is a false contract, and
a template that demands one invites code written to produce it.

## Examples

### Good

```text
Returns...... : The owner's user name, or "" when the sample has none
```

### Bad

```text
Returns...... : {.T., sOwner} on success
                {.F., {sCode, sMessage}} on failure
```

## Notes

The Bad example is bad only when the code never returns the failure envelope.
When it does, the same text is the correct contract.
