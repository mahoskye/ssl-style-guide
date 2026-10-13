---
id: transaction_owned_by_write_service
title: The service that owns the writes owns the transaction
domain: server-scripts
status: active
level: advisory
severity: info
applies_to: [server_script, class]
rule: >-
  The service that owns a related set of writes owns the transaction;
  coordinators delegate mutations rather than wrap an entire workflow in one
  broad transaction.
categories: [transactions]
related_elements: [BeginLimsTransaction, EndLimsTransaction]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Transactional Commands").
---

## Rationale

A broad transaction holds locks across steps that do not need to be atomic,
and makes every failure roll back unrelated work. The procedure that performs
a set of related writes knows what must commit together.

## Examples

### Good

```text
Main -> ValidateRequest -> WriteStatus (begins and ends its own transaction)
```

### Bad

```text
Main begins a transaction, then calls ValidateRequest, LoadSettings,
WriteStatus and NotifyOwner, and ends it at the end of the workflow.
```
