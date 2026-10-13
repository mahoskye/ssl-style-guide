---
id: atomic_writes_one_transaction
title: Atomic writes share one transaction
domain: server-scripts
status: active
level: style_only
severity: warning
applies_to: [server_script, class]
rule: >-
  Keep writes that form one atomic command in the same transaction.
categories: [transactions]
related_elements: [BeginLimsTransaction, EndLimsTransaction]
enforced_by: [reviewer]
verification:
  basis: convention
  note: >-
    Kept from the server-script baseline ("Transactional Commands"), which
    states it word for word.
---

## Rationale

Writes that must succeed or fail together, such as a status change and its
audit row, can only be undone together when they commit together.

## Examples

### Good

```text
BeginLimsTransaction
  UPDATE sample status
  INSERT sample_audit row
EndLimsTransaction(, bCommit)
```

### Bad

```text
BeginLimsTransaction, UPDATE sample status, EndLimsTransaction
BeginLimsTransaction, INSERT sample_audit row, EndLimsTransaction
```
