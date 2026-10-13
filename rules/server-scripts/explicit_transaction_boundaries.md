---
id: explicit_transaction_boundaries
title: Transaction boundaries are explicit in specs and refactors
domain: server-scripts
status: active
level: advisory
severity: warning
applies_to: [server_script, class]
rule: >-
  Do not leave transaction boundaries implicit in specs or refactors.
categories: [transactions]
machine: { list: avoid }
related_elements: [BeginLimsTransaction, EndLimsTransaction, IsInTransaction]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the transactions pack, which states it word for word.
---

## Rationale

Which procedure begins and ends a transaction decides what a failure rolls
back. A spec or refactor that does not say so leaves the implementer to
guess, and moving a write across that boundary changes behavior silently.

## Examples

### Good

```text
Spec: WriteStatus owns the transaction for the status UPDATE and the audit
INSERT. ChangeStatus does not begin one; it calls WriteStatus and returns its
envelope.
```

### Bad

```text
Spec: ChangeStatus updates the status and writes the audit row.
```
